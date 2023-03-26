import {
    MonacoEditorReactComp,
    addMonacoStyles,
} from "@typefox/monaco-editor-react/bundle";
import { buildWorkerDefinition } from "monaco-editor-workers";
import React from "react";
import { createRoot } from "react-dom/client";
import { Diagnostic, DocumentChangeResponse, LangiumAST } from "../langium-utils/langium-ast";
import { defaultText, syntaxHighlighting } from "./arithmetics-tools";

buildWorkerDefinition(
    "../../libs/monaco-editor-workers/workers",
    new URL("", window.location.href).href,
    false
);
addMonacoStyles("monaco-editor-styles");


interface PreviewProps {
    diagnostics?: Diagnostic[];
}
class Preview extends React.Component<PreviewProps, PreviewProps> {
    constructor(props: PreviewProps) {
        super(props);
        this.state = {
            diagnostics: props.diagnostics,
        };

        this.startPreview = this.startPreview.bind(this);
    }

    startPreview(diagnostics: Diagnostic[]) {
        this.setState({ diagnostics: diagnostics });
    }

    render() {

        console.log("render preview");
        // check if code contains an astNode
        if (false) {
            // Show the exception
            return (
                <div className="flex flex-col h-full w-full p-4 justify-start items-center my-10">
                    <div className="text-white border-2 border-solid border-accentRed rounded-md p-4 text-center text-sm cursor-default">
                        No Ast found
                    </div>
                </div>
            );
        }

        // if the code doesn't contain any errors
        if (this.state.diagnostics == null || (this.state.diagnostics.length == 0)) {
            return (
                <div className="flex flex-col h-full w-full p-4 float-right items-center">
                  
                </div>
            );
        }

        // Show the exception
        return (
            <div className="flex flex-col h-full w-full p-4 justify-start items-center my-10" >
                <div className="text-white border-2 border-solid border-accentRed rounded-md p-4 text-left text-sm cursor-default">
                    {this.state.diagnostics.map((diagnostic, index) =>
                        <details key={index}>
                            <summary>{`Line ${diagnostic.range.start.line}-${diagnostic.range.end.line}: ${diagnostic.message}`}</summary>
                            <p>Source: {diagnostic.source} | Code: {diagnostic.code}</p>
                        </details>
                    )}
                </div>
            </div>
        );
    }
}

class App extends React.Component<{}> {
    monacoEditor: React.RefObject<MonacoEditorReactComp>;
    preview: React.RefObject<Preview>;
    constructor(props) {
        super(props);

        // bind 'this' ref for callbacks to maintain parent context
        this.onMonacoLoad = this.onMonacoLoad.bind(this);
        this.onDocumentChange = this.onDocumentChange.bind(this);
        this.monacoEditor = React.createRef();
        this.preview = React.createRef();
    }

    /**
     * Callback that is invoked when Monaco is finished loading up.
     * Can be used to safely register notification listeners, retrieve data, and the like
     *
     * @throws Error on inability to ref the Monaco component or to get the language client
     */
    onMonacoLoad() {
        // verify we can get a ref to the editor
        if (!this.monacoEditor.current) {
            throw new Error("Unable to get a reference to the Monaco Editor");
        }

        // verify we can get a ref to the language client
        const lc = this.monacoEditor.current
            ?.getEditorWrapper()
            ?.getLanguageClient();
        if (!lc) {
            throw new Error("Could not get handle to Language Client on mount");
        }

        // register to receive DocumentChange notifications
        lc.onNotification("browser/DocumentChange", this.onDocumentChange);
    }

    /**
     * Callback invoked when the document processed by the LS changes
     * Invoked on startup as well
     * @param resp Response data
     */
    onDocumentChange(resp: DocumentChangeResponse) {
        // decode the received Ast
        this.preview.current?.startPreview(resp.diagnostics);
    }

    render() {
        const style = {
            paddingTop: "5px",
            height: "100%",
            width: "100%",
        };

        return (
            <div className="w-full h-full border border-emeraldLangium justify-center self-center flex">
                <div className="float-left w-1/2 h-full border-r border-emeraldLangium">
                    <div className="wrapper relative bg-white dark:bg-gray-900">
                        <MonacoEditorReactComp
                            ref={this.monacoEditor}
                            onLoad={this.onMonacoLoad}
                            webworkerUri="../showcase/libs/worker/arithmeticsServerWorker.js"
                            workerName="LS"
                            workerType="classic"
                            languageId="arithmetics"
                            text={defaultText}
                            syntax={syntaxHighlighting}
                            style={style}
                        />
                    </div>
                </div>
                <div className="float-right w-1/2 h-full" id="preview">
                    <Preview ref={this.preview} />
                </div>
            </div>
        );
    }
}

const root = createRoot(document.getElementById("root") as HTMLElement);
root.render(<App />);

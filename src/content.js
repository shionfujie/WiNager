import React, {useEffect} from 'react';
import ReactDOM from 'react-dom';
import "./css/content.css";
import { detachTab, moveTab, duplicate, navigateUnpinned, stash } from './util/actions'
import { PORT_NAME_DEFAULT } from "./util/constants";
import usePort from "./hooks/chrome/usePort";
import useDocumentKeydown from "./hooks/useDocumentKeydown";

function Main () {
    const port = usePort(PORT_NAME_DEFAULT)
    useDocumentKeydown(({code, shiftKey, ctrlKey, altKey, metaKey}) => {
        if (port === null) return
        if (code == "ArrowDown" && shiftKey && ctrlKey) {
            port.postMessage(detachTab())
        } else if ((code == "BracketRight" || code == "BracketLeft") && ctrlKey && altKey && metaKey) {
            port.postMessage(moveTab(code == "BracketRight" ? 1 : - 1))
        } else if (code == "KeyD" && altKey)
            port.postMessage(duplicate())
        else if (code.startsWith("Digit") && ctrlKey && altKey && metaKey)
            port.postMessage(navigateUnpinned(parseInt(code[5]) - 1))
        else if (code == "KeyS" && ctrlKey && altKey && metaKey) {
            port.postMessage(stash())
        }
    })
    return (
        <div>
        </div>
    )
}

const app = document.createElement('div');
app.id = "my-extension-root";
document.body.appendChild(app);
ReactDOM.render(<Main />, app);
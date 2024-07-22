"use client"
import React, { useState } from "react"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { dark, coy } from "react-syntax-highlighter/dist/esm/styles/prism"

interface CodeEditorProps {
	initialCode?: string
	readOnly?: boolean
	language?: string
    onChange?: () => void
    label?: string
}

const CodeEditor: React.FC<CodeEditorProps> = ({ initialCode = "", readOnly = false, language = "javascript", label }) => {
	const [code, setCode] = useState(initialCode)

	const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		setCode(e.target.value)
	}

	return (
		<div className="mb-4">
			{label && <label className="block text-gray-700 text-sm font-bold mb-2">{ label || "Code Editor"}</label>}
			{readOnly ? (
				<SyntaxHighlighter language={language} style={dark}>
					{code}
				</SyntaxHighlighter>
			) : (
				<textarea
					value={code}
					onChange={handleChange}
					className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-64"
					spellCheck="false"
					style={{ fontFamily: "monospace" }}
				/>
			)}
		</div>
	)
}

export default CodeEditor;
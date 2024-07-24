import { FC } from 'react'
import { lookupMessageByKey } from '@/utils/messages/fe-messages'
// import 'tailwindcss/tailwind.css'

interface NotificationComponentProps {
	message: string;
	dismiss?: () => void;
	visible: boolean;
	description?: string;
	type?: 'success' | 'danger' | 'info';
	rest?: any
}

const NotificationComponent: FC<NotificationComponentProps> = ({
	message,
	dismiss,
	visible,
	description,
	type = 'info',
	...rest
}) => {
	if (!message) return null
	const displayMessage = lookupMessageByKey(message) || message;
	const colorByType = {
		success: 'text-green-600',
		danger: 'text-red-600',
		info: 'text-primary',
	}
	const borderColorByType = {
		success: 'border-green-600',
		danger: 'border-red-600',
		info: 'border-primary',
	}
	const bgColorByType = {
		success: 'bg-[#00680433]',
		danger: 'bg-[#FEEDED]',
		info: 'bg-white',
	}
	// const {  } = rest;

	return (
		visible && (
			<div
				role="alert"
				className={`fixed right-5 top-5 shadow-lg rounded-md w-1/3 lg:w-1/4 xl:w-1/5 border-l-4 ${borderColorByType[type]} ${bgColorByType[type]} px-3 py-2 z-50`}
			>
				<div className="flex items-center content-center gap-4">
					<span className={colorByType[type]}>
						{type === 'success' && <svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							strokeWidth="2"
							stroke="currentColor"
							className="h-6 w-6"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>}
						{type === 'danger' && <svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							className="h-6 w-6"
						>
							<path
								fillRule="evenodd"
								d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
								clipRule="evenodd"
							/>
						</svg>}
						{type === 'info' && <svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							className="h-6 w-6"
						>
							<circle cx="12" cy="12" r="10"></circle>
							<line x1="12" y1="16" x2="12" y2="12"></line>
							<line x1="12" y1="8" x2="12" y2="8"></line>
						</svg>}
					</span>

					<div className="flex-1">
						<strong className="block font-medium text-gray-900">{displayMessage}</strong>

						{description && <p className="mt-1 text-sm text-gray-700">{description}</p>}
					</div>

					<button
						className="rounded-2xl bg-gray-50 p-2 text-gray-500 transition hover:text-black"
						onClick={() => dismiss && dismiss()}
					>
						<span className="sr-only">Dismiss popup</span>

						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							strokeWidth="1.5"
							stroke="currentColor"
							className="h-4 w-4"
						>
							<path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>
			</div>
		)
	)
}

export default NotificationComponent;

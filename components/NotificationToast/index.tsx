import { FC } from 'react'
import Image from 'next/image'
// import CloseIconSVG from 'public/icons/close-icon__primary.svg'
import { lookupMessageByKey } from '@/utils/messages/fe-messages'
import 'tailwindcss/tailwind.css'

interface NotificationComponentProps {
	message: string
	dismiss?: () => void
	visible: boolean
	description?: string
	rest?: any
}

const NotificationComponent: FC<NotificationComponentProps> = ({
	message,
	dismiss,
	visible,
	description,
	...rest
}) => {
	if (!message) return null
	const displayMessage = lookupMessageByKey(message) || message

	return (
		<div
			{...rest}
			className={`transition-opacity duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}
		>
			{displayMessage && (
				<div className="bg-gray-800 text-white p-4 rounded-md shadow-md flex items-start">
					<div className="flex-1">
						<h6 className="text-lg font-bold">{displayMessage}</h6>
						{description && <p className="text-sm">{description}</p>}
					</div>
					<button
						type="button"
						className="ml-4 flex-shrink-0"
						onClick={dismiss}
						aria-label="Close"
					>
						<Image width={24} height={24} src={''} alt="close" />
					</button>
				</div>
			)}
		</div>
	)
}

export default NotificationComponent;
import { randomBytes, createHash } from 'crypto';

/**
 * Generate a secure session token.
 * 
 * @param {string} userId - The user's unique identifier.
 * @returns {string} A secure session token.
 */
export const generateSessionToken = (userId: string): string => {
	// Generate a random 32-byte (256-bit) token using the crypto module
	const randomToken = randomBytes(32).toString('hex');

	// Combine the random token with the user ID and the current timestamp
	// Use a secure hash function to ensure the token is unique and tamper-proof
	const timestamp = Date.now().toString();
	const sessionToken = `${userId}_${timestamp}_${randomToken}`;

	// Optionally, hash the token for added security (this step is optional but recommended)
	// Here, we are using SHA-256 hash function
	const hashedToken = createHash('sha256').update(sessionToken).digest('hex');

	return hashedToken;
}

/**
 * Compares targetObject against referenceObject and returns keys
 * that are not present in referenceObject.
 * 
 * @param {Object} targetObject - The object to be checked.
 * @param {Object} referenceObject - The object with the expected keys.
 * @returns {Array} - An array of keys not present in the reference object.
 */
export const findUnexpectedKeys = (targetObject: {[key: string]: any}, referenceObject: {[key: string]: any}) => {
	// Get keys of the target object
	const targetKeys = Object.keys(targetObject);
	
	// Get keys of the reference object
	const referenceKeys = new Set(Object.keys(referenceObject));
	
	// Find keys in target object that are not in reference object
	const unexpectedKeys = targetKeys.filter(key => !referenceKeys.has(key));
	
	return unexpectedKeys;
  };

  /**
 * Converts an array into a comma-separated string with "and" before the last element.
 * 
 * @param {Array} array - The array to be converted.
 * @returns {string} - The formatted string.
 */
export const arrayToCommaSeparatedStringWithAnd = (array: string[]) => {
	const length = array.length;
	
	if (length === 0) {
	  return '';
	} else if (length === 1) {
	  return array[0];
	} else if (length === 2) {
	  return array.join(' and ');
	} else {
	  return `${array.slice(0, length - 1).join(', ')}, and ${array[length - 1]}`;
	}
  };

//  export function base64ToUint8Array(base64String: string) {
// 	// Decode the base64 string to binary data
// 	const binaryString = atob(base64String);
	
// 	// Create a Uint8Array to hold the binary data
// 	const uint8Array = new Uint8Array(binaryString.length);
  
// 	// Convert the binary string to the Uint8Array
// 	for (let i = 0; i < binaryString.length; i++) {
// 	  uint8Array[i] = binaryString.charCodeAt(i);
// 	}
  
// 	return uint8Array;
//   }
/**
 * Converts a hexadecimal string to a Uint8Array.
 * 
 * @param {string} hexString - The hexadecimal string to convert.
 * @returns {Uint8Array} - The resulting Uint8Array.
 */
export function hexStringToUint8Array(hexString: string): Uint8Array {
	const length = hexString.length / 2
	const uint8Array = new Uint8Array(length)
	for (let i = 0; i < length; i++) {
	  uint8Array[i] = parseInt(hexString.substring(i * 2, 2), 16)
	}
	return uint8Array
  }

/**
 * Converts a Uint8Array to a base64 URL string.
 * 
 * @param {Uint8Array} uint8Array - The Uint8Array to convert.
 * @returns {string} - The resulting base64 URL string.
 */
export function uint8ArrayToBase64URL(uint8Array: Uint8Array): string {
	let binary = ''
	for (let i = 0; i < uint8Array.byteLength; i++) {
	  binary += String.fromCharCode(uint8Array[i])
	}
	const base64 = btoa(binary)
	const base64URL = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
	return base64URL
  }
  
  /**
   * Converts a hexadecimal string with a \x prefix to a base64 URL string.
   * 
   * @param {string} hexString - The hexadecimal string with a \x prefix to convert.
   * @returns {string} - The resulting base64 URL string.
   */
export  function hexStringToBase64URL(hexString: string): string {
	// Remove the \x prefix
	const cleanedHexString = hexString.slice(2)
  
	// Convert hex string to Uint8Array
	const uint8Array = hexStringToUint8Array(cleanedHexString)
  
	// Convert Uint8Array to base64 URL string
	const base64URLString = uint8ArrayToBase64URL(uint8Array)
  
	return base64URLString
  }

/**
 * Returns a random letter as a character code.
 * @returns {number} - A character code representing a random letter.
 */
export function getRandomLetter(): number {
	const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
	return letters.charCodeAt(Math.floor(Math.random() * letters.length))
}

/**
 * Generates a Uint8Array of the specified number of bytes filled with random letters.
 * @param {number} size - The number of bytes for the generated Uint8Array.
 * @returns {Uint8Array} - A Uint8Array of random letters.
 */
export function generateChallenge(size: number = 32): Uint8Array {
	const uint8Array = new Uint8Array(size)
	for (let i = 0; i < uint8Array.length; i++) {
		uint8Array[i] = getRandomLetter()
	}
	return uint8Array
}

/**
 * Converts a Uint8Array object to Base64 string
 * @param {object | {[key: string]: number}} dataObj - The object representing a Uint8Array
 * @returns {string} - The Uint8Array converted back to Base64 string representation
 */
export function uint8ArrayToBase64(dataObj: {[key: string]: number}) {
const uint8Array = new Uint8Array(Object.values(dataObj));
  let binaryString = '';
  for (let i = 0; i < uint8Array.length; i++) {
    binaryString += String.fromCharCode(uint8Array[i]);
  }
  return btoa(binaryString).replace(/=+$/, '');
}

/**
 * Converts a Base64 string to a Uint8Array.
 * @param {string} base64 - The Base64 string to decode.
 * @returns {Uint8Array} - The decoded Uint8Array.
 */
export function base64ToUint8Array(base64: string): Uint8Array {
	const binaryString = atob(base64)
	const len = binaryString.length
	const bytes = new Uint8Array(len)
	for (let i = 0; i < len; i++) {
		bytes[i] = binaryString.charCodeAt(i)
	}
	return bytes
}

/**
 * Sets up user camera
 * @param {React.RefObject<HTMLVideoElement>} hiddenVideoRef - The video stream
 * @param {React.RefObject<HTMLVideoElement>} displayVideoRef - The video stream
 * @returns {{[key: string]: any}} - The video stream returned with a boolean `success` representing setup status
 */
export const setupCamera = async (hiddenVideoRef: React.RefObject<HTMLVideoElement>): Promise<{ [key: string]: any; }> => {
	try {
	  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
	  if (hiddenVideoRef.current) {
		hiddenVideoRef.current.srcObject = stream;
		hiddenVideoRef.current.play().catch((error) => console.error('Error playing hidden video:', error));
	  }
	//   if (displayVideoRef.current) {
	// 	displayVideoRef.current.srcObject = stream;
	//   }
	  return { videoStream: stream || hiddenVideoRef.current?.srcObject, success: true };
	} catch (error) {
	  console.error('Error setting up camera:', error);
	  return { error, success: false };
	}
  };


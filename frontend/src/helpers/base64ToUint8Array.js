const base64ToUint8Array = (base64) => Uint8Array.from(atob(base64), c => c.codePointAt(0));
export default base64ToUint8Array;
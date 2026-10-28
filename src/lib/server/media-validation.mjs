export class MediaError extends Error{constructor(message,status=400){super(message);this.status=status;}}
export const categories=['Hair','Colour','Skin','Nails','Men','Bridal','Salon'];
export function mediaType(bytes,type){
 if(type==='image/jpeg'&&bytes[0]===255&&bytes[1]===216&&bytes[2]===255)return 'jpg';
 if(type==='image/png'&&bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))return 'png';
 if(type==='image/webp'&&bytes.toString('ascii',0,4)==='RIFF'&&bytes.toString('ascii',8,12)==='WEBP')return 'webp';
 if(type==='video/mp4'&&bytes.toString('ascii',4,8)==='ftyp')return 'mp4';
 if(type==='video/webm'&&bytes.subarray(0,4).equals(Buffer.from([26,69,223,163])))return 'webm';
 throw new MediaError('Choose a JPG, PNG, WebP, MP4 or WebM file.');
}

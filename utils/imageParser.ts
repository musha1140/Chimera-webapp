import { createCanvas, loadImage } from 'canvas';
import { parse } from 'papaparse';

export async function exportToPNG(data: any[]): Promise<Buffer> {
  const canvas = createCanvas(800, 600);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#000';
  ctx.font = '20px Arial';
  ctx.fillText('Members Data', 50, 50);

  let y = 100;
  data.forEach((member, index) => {
    ctx.fillText(`${index + 1}. ${member.name} - ${member.class}`, 50, y);
    y += 30;
  });

  return canvas.toBuffer();
}

export async function importFromPNG(pngData: Buffer): Promise<any[]> {
  const image = await loadImage(pngData);
  const canvas = createCanvas(image.width, image.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(image, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = parse(imageData.data.toString(), {
    header: true,
    dynamicTyping: true,
  });

  return data.data;
}

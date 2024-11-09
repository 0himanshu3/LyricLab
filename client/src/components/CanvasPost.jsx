import React, { useRef, useState } from 'react';
import axios from 'axios';

const CanvasPost = () => {
    const canvasRef = useRef(null);
    const [drawing, setDrawing] = useState(false);
    const [title, setTitle] = useState('');
    const [color, setColor] = useState('#000000');
    const [shape, setShape] = useState('free');
    const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });

    const startDrawing = (e) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        setDrawing(true);
        const ctx = canvas.getContext('2d');
        ctx.strokeStyle = color;
        setStartPoint({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY });

        if (shape === 'free') {
            ctx.beginPath();
            ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
        }
    };

    const draw = (e) => {
        if (!drawing) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        if (shape === 'free') {
            ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
            ctx.stroke();
        }
    };

    const endDrawing = (e) => {
        if (!drawing) return;
        setDrawing(false);

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        const endX = e.nativeEvent.offsetX;
        const endY = e.nativeEvent.offsetY;

        if (shape === 'rectangle') {
            ctx.strokeRect(startPoint.x, startPoint.y, endX - startPoint.x, endY - startPoint.y);
        } else if (shape === 'circle') {
            const radius = Math.sqrt(Math.pow(endX - startPoint.x, 2) + Math.pow(endY - startPoint.y, 2));
            ctx.beginPath();
            ctx.arc(startPoint.x, startPoint.y, radius, 0, Math.PI * 2);
            ctx.stroke();
        } else if (shape === 'line') {
            ctx.beginPath();
            ctx.moveTo(startPoint.x, startPoint.y);
            ctx.lineTo(endX, endY);
            ctx.stroke();
        } else if (shape === 'triangle') {
            ctx.beginPath();
            ctx.moveTo(startPoint.x, startPoint.y);
            ctx.lineTo(endX, endY);
            ctx.lineTo(startPoint.x, endY);
            ctx.closePath();
            ctx.stroke();
        } else if (shape === 'ellipse') {
            const radiusX = Math.abs(endX - startPoint.x) / 2;
            const radiusY = Math.abs(endY - startPoint.y) / 2;
            ctx.beginPath();
            ctx.ellipse(
                startPoint.x + radiusX,
                startPoint.y + radiusY,
                radiusX,
                radiusY,
                0,
                0,
                Math.PI * 2
            );
            ctx.stroke();
        }
    };

    const savePost = async () => {
        if (!title) {
            alert('Please enter a title for the post');
            return;
        }

        const canvas = canvasRef.current;
        if (!canvas) {
            alert('Canvas not available');
            return;
        }

        const image = canvas.toDataURL('image/png');

        try {
            await axios.post('http://localhost:5000/api/posts/create', { title, image });
            alert('Post saved successfully!');
        } catch (error) {
            console.error('Error saving post:', error);
            alert('Failed to save post');
        }
    };

    return (
        <div>
            <h2>Create a Post with Canvas Drawing</h2>
            <input
                type="text"
                placeholder="Enter post title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />
            <div>
                <label>Choose Color: </label>
                <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
            </div>
            <div>
                <label>Choose Shape: </label>
                <select value={shape} onChange={(e) => setShape(e.target.value)}>
                    <option value="free">Free Draw</option>
                    <option value="rectangle">Rectangle</option>
                    <option value="circle">Circle</option>
                    <option value="line">Line</option>
                    <option value="triangle">Triangle</option>
                    <option value="ellipse">Ellipse</option>
                </select>
            </div>
            <canvas
                ref={canvasRef}
                width={600}
                height={400}
                style={{ border: '1px solid #000' }}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={endDrawing}
                onMouseLeave={endDrawing}
            />
            <button onClick={savePost}>Save Post</button>
        </div>
    );
};

export default CanvasPost;

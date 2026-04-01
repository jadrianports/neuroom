import { CheckCircle, ImageIcon, UploadIcon } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react'
import { useOutletContext } from 'react-router';
import {
    PROGRESS_INTERVAL_MS,
    PROGRESS_STEP,
    REDIRECT_DELAY_MS,
} from '../lib/constants';

interface UploadProps {
    onComplete?: (base64: string) => void;
    onDragging?: (isDragging: boolean) => void;
}

const Upload = ({ onComplete, onDragging }: UploadProps) => {
    const [file, setFile] = useState<File | null>(null);
    const [dragging, setDragging] = useState(false);
    const [progress, setProgress] = useState(0);
    const { isSignedIn } = useOutletContext<AuthContext>();
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    const ACCEPTED_TYPES = ['image/jpeg', 'image/png'];
    const MAX_SIZE = 50 * 1024 * 1024;

    const validateFile = (f: File): { ok: boolean; reason?: string } => {
        if (!ACCEPTED_TYPES.includes(f.type)) {
            return { ok: false, reason: 'Only JPG and PNG files are accepted.' };
        }
        if (f.size > MAX_SIZE) {
            return { ok: false, reason: 'File exceeds the 50 MB size limit.' };
        }
        return { ok: true };
    };

    const processFile = (selected: File) => {
        const result = validateFile(selected);
        if (!result.ok) {
            setError(result.reason!);
            return;
        }
        setError(null);
        setFile(selected);
        setProgress(0);

        const reader = new FileReader();
        reader.onerror = () => {
            setFile(null);
            setProgress(0);
            setError('Failed to read file. Please try again.');
        };
        reader.onload = () => {
            const base64 = reader.result as string;

            if (intervalRef.current) clearInterval(intervalRef.current);

            intervalRef.current = setInterval(() => {
                setProgress((prev) => {
                    const next = Math.min(prev + PROGRESS_STEP, 100);
                    if (next >= 100) {
                        if (intervalRef.current) clearInterval(intervalRef.current);
                        intervalRef.current = null;
                        timeoutRef.current = setTimeout(() => {
                            timeoutRef.current = null;
                            onComplete?.(base64);
                        }, REDIRECT_DELAY_MS);
                    }
                    return next;
                });
            }, PROGRESS_INTERVAL_MS);
        };
        reader.readAsDataURL(selected);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (!isSignedIn || !selected) return;
        processFile(selected);
    };

    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (isSignedIn) {
            setDragging(true);
            onDragging?.(true);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragging(false);
        onDragging?.(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragging(false);
        onDragging?.(false);
        if (!isSignedIn) return;
        const dropped = e.dataTransfer.files?.[0];
        if (dropped) processFile(dropped);
    };

    return (
        <div className='upload'>
            {!file ? (
                <div
                    className={`dropzone ${dragging ? 'is-dragging' : ''}`}
                    onDragEnter={handleDragEnter}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <input
                        ref={inputRef}
                        type="file"
                        className='drop-input'
                        accept=".jpg,.jpeg,.png"
                        disabled={!isSignedIn}
                        onChange={handleChange}
                    />

                    <div className='drop-content'>
                        <div className='drop-icon'>
                            <UploadIcon size={20} />
                        </div>
                        <p>
                            {isSignedIn
                                ? 'Drag and drop your floor plan here, or click to select a file'
                                : 'Please sign in to upload your floor plan'}
                        </p>
                        {error
                            ? <p className='help' style={{ color: '#ef4444' }}>{error}</p>
                            : <p className='help'>Maximum file size is 50 MB.</p>
                        }
                    </div>
                </div>
            ) : (
                <div className='upload-status'>
                    <div className='status-content'>
                        <div className='status-icon'>
                            {progress === 100 ? (
                                <CheckCircle className='check' />
                            ) : (
                                <ImageIcon className='image' />
                            )}
                        </div>

                        <h3>{file.name}</h3>
                        <div className='progress'>
                            <div className='bar' style={{ width: `${progress}%` }}></div>
                            <p className='status-text'>
                                {progress < 100 ? 'Analyzing Floor Plan...' : 'Redirecting...'}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Upload
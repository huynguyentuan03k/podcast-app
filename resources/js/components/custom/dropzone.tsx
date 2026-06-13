import { cn } from '@/lib/utils';
import { type ReactNode } from 'react';
import { type Accept, useDropzone } from 'react-dropzone';

interface DropzoneProps {
    onDrop: (acceptedFiles: File[]) => void;
    accept?: Accept;
    children?: ReactNode;
    className?: string;
}

export default function Dropzone({ accept, children, className, onDrop }: DropzoneProps) {
    const { getRootProps, getInputProps, isDragActive } = useDropzone({ accept, multiple: false, onDrop });

    return (
        <div
            {...getRootProps()}
            className={cn(
                'cursor-pointer rounded-md border-2 border-dashed border-gray-300 p-4 text-center transition-colors hover:bg-gray-50',
                isDragActive && 'border-blue-500 bg-blue-50',
                className,
            )}
        >
            <input {...getInputProps()} />
            {children ?? (isDragActive ? <p>Drop the files here...</p> : <p>Drag & drop file here, or click to select</p>)}
        </div>
    );
}

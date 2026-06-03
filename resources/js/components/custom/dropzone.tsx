import { useDropzone } from 'react-dropzone';

interface DropzoneProps {
    onDrop: (acceptedFiles: File[]) => void;
}

export default function Dropzone({ onDrop }: DropzoneProps) {
    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

    return (
        <div {...getRootProps()} className="cursor-pointer rounded-md border-2 border-dashed border-gray-300 p-4 text-center hover:bg-gray-50">
            <input {...getInputProps()} />
            {isDragActive ? <p>Drop the files here...</p> : <p>Drag & drop file here, or click to select</p>}
        </div>
    );
}

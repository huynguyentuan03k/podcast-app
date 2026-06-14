import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle2, LoaderCircle, XCircle } from 'lucide-react';
import { forwardRef, useRef, useState } from 'react';

export type AudioValidationStatus = 'idle' | 'loading' | 'valid' | 'invalid';

type AudioUrlValidatorProps = {
    value: string;
    status: AudioValidationStatus;
    duration: number | null;
    onChange: (value: string) => void;
    onValidated: (status: AudioValidationStatus, duration: number | null) => void;
};

function formatDuration(seconds: number | null) {
    if (!seconds) {
        return '0:00';
    }

    const minutes = Math.floor(seconds / 60);
    const rest = Math.floor(seconds % 60);

    return `${minutes}:${String(rest).padStart(2, '0')}`;
}

const AudioUrlValidator = forwardRef<HTMLTextAreaElement, AudioUrlValidatorProps>(({ value, status, duration, onChange, onValidated }, ref) => {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [message, setMessage] = useState('');

    const validateUrl = async () => {
        const url = value.trim();

        if (!url) {
            setMessage('Audio URL is required.');
            onValidated('invalid', null);
            return;
        }

        try {
            new URL(url);
        } catch {
            setMessage('Audio URL format is invalid.');
            onValidated('invalid', null);
            return;
        }

        onValidated('loading', null);
        setMessage('');

        const audio = new Audio();
        audioRef.current = audio;

        const result = await new Promise<{ status: 'valid' | 'invalid'; duration: number | null; message?: string }>((resolve) => {
            const timeout = window.setTimeout(() => {
                resolve({ status: 'invalid', duration: null, message: 'Audio metadata timed out.' });
            }, 12000);

            audio.preload = 'metadata';
            audio.onloadedmetadata = () => {
                window.clearTimeout(timeout);
                resolve({ status: 'valid', duration: Math.ceil(audio.duration || 0) });
            };
            audio.onerror = () => {
                window.clearTimeout(timeout);
                resolve({ status: 'invalid', duration: null, message: 'Cannot load audio metadata from this URL.' });
            };
            audio.src = url;
        });

        audio.pause();
        audio.removeAttribute('src');
        audio.load();
        audioRef.current = null;

        setMessage(result.message ?? '');
        onValidated(result.status, result.duration);
    };

    return (
        <div className="space-y-2">
            <Textarea
                ref={ref}
                className="min-h-28"
                value={value}
                disabled={status === 'loading'}
                placeholder="https://example.com/audio.mp3"
                onChange={(event) => {
                    onChange(event.target.value);
                    onValidated('idle', null);
                    setMessage('');
                }}
            />
            <div className="flex flex-wrap items-center gap-2">
                <Button type="button" variant="outline" disabled={status === 'loading'} onClick={() => void validateUrl()}>
                    {status === 'loading' ? <LoaderCircle className="mr-2 size-4 animate-spin" /> : null}
                    Check audio URL
                </Button>
                {status === 'valid' ? (
                    <Badge className="gap-1 bg-emerald-600 text-white hover:bg-emerald-600">
                        <CheckCircle2 className="size-3" />
                        Valid
                    </Badge>
                ) : null}
                {status === 'invalid' ? (
                    <Badge variant="destructive" className="gap-1">
                        <XCircle className="size-3" />
                        Invalid
                    </Badge>
                ) : null}
                <span className="text-sm text-muted-foreground">Duration: {formatDuration(duration)}</span>
                {message ? <span className="text-sm text-destructive">{message}</span> : null}
            </div>
        </div>
    );
});

AudioUrlValidator.displayName = 'AudioUrlValidator';

export default AudioUrlValidator;

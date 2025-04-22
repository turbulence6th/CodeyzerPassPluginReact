import React, { useState, useEffect } from 'react';
import { ProgressBar } from 'primereact/progressbar';
import zxcvbn from 'zxcvbn';

interface PasswordStrengthMeterProps {
    password?: string; // Make password optional to handle initial state
}

interface SifreGucuState {
    score: number; // 0-4
    label: string;
    color: string; // Progress bar color
    progressBarValue: number; // 0-100
}

const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ password }) => {
    const [sifreGucu, sifreGucuDegistir] = useState<SifreGucuState | null>(null);

    useEffect(() => {
        if (!password) {
            sifreGucuDegistir(null);
            return;
        }
        const result = zxcvbn(password);
        const score = result.score;
        let label = '';
        let color = '';
        let progressBarValue = 0;

        switch (score) {
            case 0:
                label = 'Çok Zayıf';
                color = '#dc3545'; // Red
                progressBarValue = 10;
                break;
            case 1:
                label = 'Zayıf';
                color = '#dc3545'; // Red
                progressBarValue = 25;
                break;
            case 2:
                label = 'Orta';
                color = '#fd7e14'; // Orange
                progressBarValue = 50;
                break;
            case 3:
                label = 'Güçlü';
                color = '#198754'; // Green
                progressBarValue = 75;
                break;
            case 4:
                label = 'Çok Güçlü';
                color = '#198754'; // Green
                progressBarValue = 100;
                break;
            default:
                label = '';
                color = '#dee2e6';
                progressBarValue = 0;
                break;
        }
        sifreGucuDegistir({ score, label, color, progressBarValue });
    }, [password]);

    return (
        <ProgressBar
            value={sifreGucu?.progressBarValue ?? 0}
            showValue={false}
            style={{
                position: 'absolute',
                bottom: '3px',
                left: '4px',
                right: '4px',
                height: '2px',
                visibility: sifreGucu ? 'visible' : 'hidden',
                opacity: sifreGucu ? 1 : 0,
                transition: 'visibility 0s linear 0s, opacity 0.3s linear',
                // Ensure it appears above the input border/background if needed
                zIndex: 1 
            }}
            pt={{
                value: { style: { background: sifreGucu?.color ?? '#dee2e6' } }
            }}
        />
    );
};

export default PasswordStrengthMeter; 
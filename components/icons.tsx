
import React from 'react';

export const CarIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M5.33398 14C4.22942 14 3.33398 14.8954 3.33398 16C3.33398 17.1046 4.22942 18 5.33398 18C6.43855 18 7.33398 17.1046 7.33398 16C7.33398 14.8954 6.43855 14 5.33398 14Z" />
        <path d="M18.667 14C17.5624 14 16.667 14.8954 16.667 16C16.667 17.1046 17.5624 18 18.667 18C19.7715 18 20.667 17.1046 20.667 16C20.667 14.8954 19.7715 14 18.667 14Z" />
        <path d="M21.733 9.42188L19.458 4.61133C19.1659 3.99147 18.528 3.58398 17.828 3.58398H6.17198C5.47197 3.58398 4.83401 3.99147 4.54198 4.61133L2.26698 9.42188C1.50346 10.9997 2.61055 12.834 4.33298 12.834H19.667C21.3894 12.834 22.4965 10.9997 21.733 9.42188Z" />
    </svg>
);

export const ResetIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.664 0l3.181-3.183m-11.664 0l4.992-4.993m-4.993 0l-3.181 3.183a8.25 8.25 0 000 11.664l3.181 3.183" />
    </svg>
);

export const UploadIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
  </svg>
);

export const DownloadIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
    </svg>
);

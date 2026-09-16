export function deathPresentation(remaining){const opacity=Math.max(0,Math.min(1,remaining/.78));return {opacity,flash:Math.max(0,1-(.78-remaining)/.16)};}

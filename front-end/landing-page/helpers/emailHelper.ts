export function convertToHtmlForm(data: Record<string, string>): string {
    let html = `<div style="font-family: Arial, sans-serif; line-height: 1.6;">`;
    html += `<h2>New Form Submission</h2>`;
    html += `<table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; width: 100%;">`;

    for (const [key, value] of Object.entries(data)) {
        html += `
      <tr>
        <td style="font-weight: bold; text-transform: capitalize;">${key}</td>
        <td>${value}</td>
      </tr>
    `;
    }

    html += `</table></div>`;
    return html;
}

export const format = (originalStr: string, words: string[]) => {
    let a = originalStr;
    for (const k in words) {
        a = a.replace('{' + k + '}', words[k]);
    }
    return a;
};

export const dataURLtoFile = (dataurl: string, filename: string): File => {
    const arr = dataurl.split(','),
        mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n-- > 0) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, {
        type: mime,
    });
};

export const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
};

// Currency formatter for CSV: avoids non-breaking space that Excel may render as 'Â'
export const formatCurrencyCSV = (amount: number) => {
    const numberPart = new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0 }).format(amount);
    return `Rp ${numberPart}`; // regular space between Rp and number
};

export const formatIdNumber = (value: number) => {
    if (!Number.isFinite(value)) return '';
    return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(value);
};

export const parseIdNumber = (input: string, opts?: { allowNegative?: boolean }) => {
    const allowNegative = opts?.allowNegative ?? false;
    const trimmed = (input ?? '').trim();
    if (trimmed === '') return '';

    let sign = '';
    let body = trimmed;

    if (allowNegative && body.startsWith('-')) {
        sign = '-';
        body = body.slice(1);
    }

    const digits = body.replace(/\D+/g, '');
    if (digits === '') return sign ? '-' : '';

    const normalized = digits.replace(/^0+(\d)/, '$1');
    return sign + normalized;
};

export const formatIdFromRaw = (raw: string, opts?: { allowNegative?: boolean }) => {
    const allowNegative = opts?.allowNegative ?? false;
    if (!raw) return '';
    if (allowNegative && raw === '-') return '-';

    const negative = allowNegative && raw.startsWith('-');
    const digits = negative ? raw.slice(1) : raw;
    const n = Number(digits);
    if (!Number.isFinite(n)) return '';

    const formatted = formatIdNumber(n);
    return negative ? `-${formatted}` : formatted;
};

export const formatRupiahCompact = (amount: number): string => {
    if (!Number.isFinite(amount)) return 'Rp 0';
    const abs = Math.abs(amount);
    const sign = amount < 0 ? '-' : '';

    if (abs >= 1_000_000_000) {
        return `${sign}Rp ${(abs / 1_000_000_000).toFixed(1).replace(/\.0$/, '')} M`;
    }
    if (abs >= 1_000_000) {
        return `${sign}Rp ${(abs / 1_000_000).toFixed(1).replace(/\.0$/, '')} Jt`;
    }
    if (abs >= 1_000) {
        return `${sign}Rp ${(abs / 1_000).toFixed(0)} Rb`;
    }
    return `${sign}Rp ${abs}`;
};


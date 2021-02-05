export function generateId(length = 8) {
    const str = '0123456789abcdefghijklmnopqrstuvwxyz';
    return Array.apply(null, { length }).reduce(
        res => res + str[Math.floor(Math.random() * 36)],
        ''
    );
}

export function generateCardId(type) {
    return type.replace('/', '_') + '_' + generateId();
}

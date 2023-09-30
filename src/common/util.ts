export castExists<T>(value: T|undefined): T {
    if (value === undefined) {
        throw new ValueError('Unexpected undefined');
    }
    return value;
}

export enum Row {
    None,
    A,
    B,
    C,
    D,
    E,
    F,
    G,
    H,
    I,
};

export const StringToRow = {
    "": Row.None,
    "A": Row.A,
    "B": Row.B,
    "C": Row.C,
    "D": Row.D,
    "E": Row.E,
    "F": Row.F,
    "G": Row.G,
    "H": Row.H,
    "I": Row.I,
};

export const RowToX = {
    [Row.None]: 1000,
    [Row.A]: 0,
    [Row.B]: 1,
    [Row.C]: 2,
    [Row.D]: 3,
    [Row.E]: 4,
    [Row.F]: 5,
    [Row.G]: 6,
    [Row.H]: 7,
    [Row.I]: 8,
}

export enum Column {
    None,
    One,
    Two,
    Three,
    Four,
    Five,
    Six,
    Seven,
    Eight,
    Nine,
};

export const StringToColumn = {
    "": Column.None,
    "1": Column.One,
    "2": Column.Two,
    "3": Column.Three,
    "4": Column.Four,
    "5": Column.Five,
    "6": Column.Six,
    "7": Column.Seven,
    "8": Column.Eight,
    "9": Column.Nine,
};

export const ColumnToY = {
    [Column.None]: 1000,
    [Column.One]: 0,
    [Column.Two]: 1,
    [Column.Three]: 2,
    [Column.Four]: 3,
    [Column.Five]: 4,
    [Column.Six]: 5,
    [Column.Seven]: 6,
    [Column.Eight]: 7,
    [Column.Nine]: 8,
}
export type Position = {
    x: Row,
    y: Column,
};

export const getPositionLabel = (lastMove: number[]) => {
    return `${String.fromCharCode(65+lastMove[0])}${lastMove[1]+1}`;
}

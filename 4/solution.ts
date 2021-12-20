import fs from 'fs';
import path from 'path';

const preprocessInput = async (): Promise<[number[], Set<number>[][] | any]> => {
    let input = 
        (await fs.promises.readFile(path.resolve(__dirname, 'input.txt'), 'utf-8'))
            .split('\n')
            .filter(item => item);
    
    const drawn = input.shift()!.split(',').map(strNum => parseInt(strNum));

    const boardSet = [];

    for (let i = 0; i < input.length; i += 5) {
        // Remove extra spaces
        const board = input.slice(i, i + 5).map(line => line.split(' ').filter(num => num).map(num => parseInt(num)));

        // Add rows as sets
        const processed = board.map(line => new Set(line));

        // Add cols as sets
        for (let j = 0; j < 5; j++) {
            processed.push(new Set([
                board[0][j], 
                board[1][j], 
                board[2][j], 
                board[3][j], 
                board[4][j]
            ]));
        }

        boardSet.push(processed);
    }


    return [drawn, boardSet];
}

const sumSet = (set: Set<number>) =>
    Array.from(set.values()).reduce((sum, val) => sum + val, 0);


const sumBoard = (board: Set<number>[]) =>
    board.reduce((sum: number, row: Set<number>) => {
        return sum + sumSet(row);
    }, 0);


// "Mark off" drawn numbers per row/col in board by deleting them from the set
const markBoard = (board: Set<number>[], drawnNum: number) => {
    for (const row of board) {
        row.has(drawnNum) && row.delete(drawnNum);
    }
}

const hasWinner = (board: Set<number>[]) => board.some((row: Set<number>) => row.size === 0);

const firstWinner = async () => {
    const [drawn, boardSet] = await preprocessInput();

    for (const drawnNum of drawn) {
        for (const board of boardSet) {
            markBoard(board, drawnNum);

            // If a set is size 0, this means all 5 numbers in its row/col have been drawn
            if (hasWinner(board)) {
                return sumBoard(board.slice(0, 5)) * drawnNum;
            }
        }
    }
}

const lastWinner = async () => {
    let [drawn, boardSet] = await preprocessInput();

    for (const drawnNum of drawn) {
        let toRemove = [];

        for (let i = 0; i < boardSet.length; i++) {
            markBoard(boardSet[i], drawnNum);

            // If a set is size 0, this means all 5 numbers in its row/col have been drawn
            if (hasWinner(boardSet[i])) {
                if (boardSet.length === 1) {
                    return sumBoard(boardSet[i].slice(0, 5)) * drawnNum;
                    
                }
                // There are still more than 1 boards, so remove winning board
                toRemove.push(i);
            }
        }

        // Remove all winners (using this instead of splice because the indices get messed up if there are multiple remove indices)
        toRemove.forEach(removeIdx => boardSet[removeIdx] = false);
        boardSet = boardSet.filter((board: Set<number>[]) => board);
        toRemove = [];
    }
}

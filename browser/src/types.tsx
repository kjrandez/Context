export type StrDict<T> = {[_: string]: T};
export type NumDict<T> = {[_: number]: T};

export interface Model { type: string }

type PageEntry = {index: number, eid: number}
export interface PageModel extends Model {
    entries: PageEntry[]
}

export interface TextModel extends Model {
    text: string
}

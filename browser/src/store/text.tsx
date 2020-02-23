import {ViewState, traverse} from '.';
import diff from 'fast-diff';

export default class TextActions
{
    constructor(private state: ViewState) {}

    edit(path: number[], newContent: string) {
        let node = traverse(this.state.root, path);
        let {element} = node;
        let {content} = this.state.db[element.id].value;

        let {start, stop, addition} = spliceFromDiff(content, newContent);
    
        // Send the computed splice
        console.log("Splice from " + start + " to " + stop + "[" + addition + "]");
        element.send("splice", [start, stop, addition]);

        // Perform the computed splice locally.. necessary ?
        // const newContent = strSplice(prevContent, start, stop - start, addition);
        // this.store.db[node.element.id].value.content = newContent;
    }
}

function spliceFromDiff(oldValue: string, newValue: string) {
    var result = diff(oldValue, newValue);
    
    var position = 0;
    var start = null;
    var stop = null;
    var addition = "";

    // Convert insertions and deletions into a single splice

    for(var i = 0; i < result.length; i++) {
        const type = result[i][0];
        const text = result[i][1];

        if(type === 1) {
            // Insertion (this text is not present in original)
            if(start == null) {
                // This becomes the starting position of the splice
                start = position;
            }

            // Addition is noted to be spliced in
            addition += text;

            // Position is not advanced
        }
        else if(type === -1) {
            // Deletion (this text IS present in original)
            if(start == null) {
                // This becomes the starting position of the splice
                start = position;
            }

            // Advance position in original string
            position += text.length;
        }
        else {
            // Unchanged, advance unless there are no more insertions/deletions
            if(i < result.length - 1) {
                if(start != null) {
                    // If the splice has already started, this text goes into it
                    addition += text;
                }

                // Advance position in original string
                position += text.length;
            }
        }
    }

    if(start == null) {
        start = 0;
        stop = 0;
    }
    else {
        // Ending point of the splice is the last position we advanced to
        stop = position;
    }

    return {start, stop, addition};
}

/*function strSplice(str: string, index: number, amount: number, add: string) {
    return str.substring(0, index) + add + str.substring(index + amount);
}*/

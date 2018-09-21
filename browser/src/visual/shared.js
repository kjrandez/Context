import React from 'react';
import Text from './text.js';
import Image from './image.js';
import Page from './page.js';

function timesInArray(anItem, array) {
    var count = 0;
    array.forEach(item => {
        if(item === anItem)
            count++
    });
    return count;
}

export function elementList(fragments, path, selection, app) {
    return fragments.map((fragment, index) => {

        var key = fragment.key();
        if(timesInArray(fragment, fragments) > 1)
            key += "-" + index;

        switch(fragment.type()) {
            case "Page":
                return <Page
                    key={key}
                    fragment={fragment}
                    index={index}
                    path={path}
                    selection={selection}
                    app={app} />;
            case "Text":
                return <Text
                    key={key}
                    fragment={fragment}
                    index={index}
                    path={path}
                    selection={selection}
                    app={app} />;
            case "Image":
                return <Image
                    key={key}
                    fragment={fragment}
                    index={index}
                    path={path}
                    selection={selection}
                    app={app} />;
            default:
                return <p key={fragment.key()}>
                    Undefined element: {fragment.type()}
                </p>;
        }
    });
}

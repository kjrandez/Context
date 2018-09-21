import React from 'react';
import Text from './text.js';
import Image from './image.js';
import Page from './page.js';

export function elementList(fragments, path, selection, app) {
    return fragments.map((fragment, index) => {
        var key = fragment.key() + "-" + index;
        switch(fragment.type()) {
            case "page":
                return <Page
                    key={key}
                    fragment={fragment}
                    index={index}
                    path={path}
                    selection={selection}
                    app={app} />;
            case "text":
                return <Text
                    key={key}
                    fragment={fragment}
                    index={index}
                    path={path}
                    selection={selection}
                    app={app} />;
            case "image":
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

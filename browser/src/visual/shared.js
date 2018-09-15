import React from 'react';
import Text from './Text.js';
import Image from './Image.js';
import Page from './Page.js';

export function elementList(fragments, selection, app) {
    return fragments.map(fragment => {
        switch(fragment.type()) {
            case "page":
                return <Page
                    key={fragment.key()}
                    fragment={fragment}
                    selection={selection}
                    app={app} />;
            case "text":
                return <Text
                    key={fragment.key()}
                    fragment={fragment}
                    selection={selection}
                    app={app} />;
            case "image":
                return <Image
                    key={fragment.key()}
                    fragment={fragment}
                    selection={selection}
                    app={app} />;
            default:
                return <p key={fragment.key()}>
                    Undefined element: {fragment.type()}
                </p>;
        }
    });
}

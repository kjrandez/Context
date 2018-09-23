import React from 'react';
import {Text, Image, Page, Script} from './element';

export function elementList(entries, path, selection, app) {
    return entries.map(entry => {
        switch(entry.fragment.type()) {
            case "Page":
                return <Page
                    key={entry.key}
                    fragment={entry.fragment}
                    loc={{path: path, key: entry.key}}
                    selection={selection}
                    app={app} />;
            case "Text":
                return <Text
                    key={entry.key}
                    fragment={entry.fragment}
                    loc={{path: path, key: entry.key}}
                    selection={selection}
                    app={app} />;
            case "Image":
                return <Image
                    key={entry.key}
                    fragment={entry.fragment}
                    loc={{path: path, key: entry.key}}
                    selection={selection}
                    app={app} />;
            case "Script":
                return <Script 
                    key={entry.key}
                    fragment={entry.fragment}
                    loc={{path: path, key: entry.key}}
                    selection={selection}
                    app={app} />;
            default:
                return <p key={entry.key}>
                    Undefined element: {entry.fragment.type()}
                </p>;
        }
    });
}

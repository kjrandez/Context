import React from 'react';
import {Text, Image, Page, Script} from './element';
import AppendButton from './appendButton';

export function elementList(entries, path, selection, app, showAppend) {
    var result = entries.map(entry => {
        switch(entry.fragment.type()) {
            case "Page":
                return <Page
                    key={entry.key}
                    fragment={entry.fragment}
                    loc={{path: path, key: entry.key, latest: entry.latest}}
                    selection={selection}
                    app={app} />;
            case "Text":
                return <Text
                    key={entry.key}
                    fragment={entry.fragment}
                    loc={{path: path, key: entry.key, latest: entry.latest}}
                    selection={selection}
                    app={app} />;
            case "Image":
                return <Image
                    key={entry.key}
                    fragment={entry.fragment}
                    loc={{path: path, key: entry.key, latest: entry.latest}}
                    selection={selection}
                    app={app} />;
            case "Script":
                return <Script 
                    key={entry.key}
                    fragment={entry.fragment}
                    loc={{path: path, key: entry.key, latest: entry.latest}}
                    selection={selection}
                    app={app} />;
            default:
                return <p key={entry.key}>
                    Undefined element: {entry.fragment.type()}
                </p>;
        }
    });

    if(showAppend) {
        result.push(<AppendButton key="append" path={path} app={app} />)
    }

    return result;
}

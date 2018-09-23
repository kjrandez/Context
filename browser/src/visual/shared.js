import React from 'react';
import { Element } from './element';
import AppendButton from './appendButton';

export function elementList(entries, path, selection, app, showAppend) {
    var result = entries.map(entry =>
        <Element
        key={entry.key}
        fragment={entry.fragment}
        loc={{path: path, key: entry.key, latest: entry.latest}}
        selection={selection}
        app={app} />
    );
    if(showAppend)
        result.push(<AppendButton key="append" path={path} app={app} />);

    return result;
}

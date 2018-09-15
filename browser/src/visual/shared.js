import React from 'react';
import Text from './Text.js';
import Image from './Image.js';
import Page from './Page.js';

export function elementList(fragments) {
    return fragments.map(fragment => {
        switch(fragment.type()) {
            case "page":
                return <Page key={fragment.key()} fragment={fragment} />;
            case "text":
                return <Text key={fragment.key()} fragment={fragment} />;
            case "image":
                return <Image key={fragment.key()} fragment={fragment} />;
            default:
                return <p key={fragment.key()} fragment={fragment}>Undefined element</p>;
        }
    });
}

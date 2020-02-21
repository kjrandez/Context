import React, {Component, ReactElement} from 'react';
import Element, {ElementProps} from '.';
import {PageValue} from '../types';
import {observer} from 'mobx-react';

export interface PageProps extends ElementProps { value: PageValue }

class Page extends Component<PageProps>
{
    render(): ReactElement {
        const {store, value, path} = this.props;

        let elements = value.entries.map(
            ({key, element}) =>
                <Element
                    store={store}
                    path={[...path, key]}
                    eid={element.id}
                    key={key} />
        );

        return <>{elements}</>
    }
}

export default observer(Page);
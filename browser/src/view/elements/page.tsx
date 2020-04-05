import React, {Component, ReactElement} from 'react';
import PageEntry, {ElementProps} from '.';
import {Model, PageValue} from '../../types';
import AppendButton from '../append';
import {observer} from 'mobx-react';

export interface PageProps extends ElementProps { model: Model<PageValue> }

class Page extends Component<PageProps>
{
    render(): ReactElement {
        const {store, model: {value}, path} = this.props;

        let elements = value.entries.map(
            ({index, entity}) =>
                <PageEntry
                    store={store}
                    path={[...path, index]}
                    eid={entity.id}
                    key={index}/>
        );

        return <>{elements}<AppendButton {...{store, path}}/></>
    }
}

export default observer(Page);

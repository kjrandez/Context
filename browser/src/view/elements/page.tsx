import React, {Component, ReactElement} from 'react';
import PageEntry, {ElementProps} from '.';
import {Model, PageValue} from '../../types';
import {observer} from 'mobx-react';

export interface PageProps extends ElementProps { model: Model<PageValue> }

class Page extends Component<PageProps>
{
    render(): ReactElement {
        const {store, model: {value}, path} = this.props;

        let elements = value.entries.map(
            ({key, element}) =>
                <PageEntry
                    store={store}
                    path={[...path, key]}
                    eid={element.id}
                    key={key} />
        );

        return <>{elements}<button style={{marginLeft: "5px"}}>+ Insert</button></>
    }
}

export default observer(Page);
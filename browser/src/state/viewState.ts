import { configure, action, observable } from 'mobx';
import { Proxy } from '../client';
import { NumDict } from '../interfaces';
import { ElementModel, PageValue } from '../models';

configure({enforceActions: 'observed'});

export default class ViewState
{
    @observable topPage: Proxy<any> | null = null;
    models: NumDict<ElementModel> = {};

    navigate(page: Proxy<any> | null) {
        this.navigateFetch(page).then(models => this.navigateComplete(page, models));
    }

    @action navigateComplete(page: Proxy<any> | null, models: NumDict<ElementModel>) {
        this.models = models;
        this.topPage = page;
    }

    private async navigateFetch(page: Proxy<any> | null) {
        if (page == null)
            return {}
        
        let pageModel = await page.call<ElementModel>('model');
        let existing: NumDict<ElementModel> = {};
        existing[pageModel.id] = pageModel;

        return fetchNonPresentModels(existing, pageModel);
    }

    @action modelUpdated(obj: Proxy<any>, value: any) {
        let model = this.models[obj.id];
        console.log(model);
        model.value = value;
    }
}

async function fetchNonPresentModels(
    models: NumDict<ElementModel>,
    root: ElementModel
) {
    let newModels: NumDict<ElementModel> = {};

    // Add models for entries of the current page (root)
    for (const entry of (root.value as PageValue).entries) {
        if (!(entry.element.id in newModels)) {
            let model = new ElementModel(await entry.element.call<ElementModel>('model'));
            newModels[entry.element.id] = model;
        }
    }

    // Merge new models into existing
    models = {...models, ...newModels};

    // If any of the new models are pages, iterate into them
    for (const model of Object.values(newModels)) {
        if (model.type === 'page') {
            models = {...models, ...await fetchNonPresentModels(models, model)}
        }
    }

    return models;
}

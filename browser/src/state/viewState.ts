import { configure, action, observable } from 'mobx';
import { Proxy } from '../client';
import { NumDict } from '../interfaces';
import { ElementModel, PageValue, IElementModel } from './models';

configure({enforceActions: 'observed'});

export class NestedPage
{
    @observable expanded: boolean = false;
    subpages: NumDict<NestedPage> = {};

    constructor(subpages: NumDict<NestedPage>) {
        this.subpages = subpages;
    }
}

export default class ViewState
{
    @observable topPage: Proxy<any> | null = null;
    models: NumDict<ElementModel> = {};
    subpages: NumDict<NestedPage> = {};

    navigate(page: Proxy<any> | null) {
        this.navigateFetch(page).then(models => this.navigateComplete(page, models));
    }

    @action navigateComplete(page: Proxy<any> | null, models: NumDict<ElementModel>) {
        this.models = models;
        this.subpages = makePageHierarchy(page, models)
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

    @action pageExpanded(nestedPage: NestedPage) {
        nestedPage.expanded = true;
    }
}

function makePageHierarchy(page: Proxy<any> | null, models: NumDict<ElementModel>): NumDict<NestedPage> {
    var subpages: NumDict<NestedPage> = {};
    if (page == null)
        return subpages

    let entries = (models[page.id].value as PageValue).entries;
    for (const entry of entries) {
        if(models[entry.element.id].type === 'Page') {
            let nestedSubpages = makePageHierarchy(entry.element, models);
            subpages[entry.key] = new NestedPage(nestedSubpages);
        }
    }
    
    return subpages;
}

async function fetchNonPresentModels(
    models: NumDict<ElementModel>,
    root: ElementModel
) {
    let newModels: NumDict<ElementModel> = {};

    // Add models for entries of the current page (root)
    let pageEntries = (root.value as PageValue).entries;
    for (const entry of pageEntries) {
        if (!(entry.element.id in newModels)) {
            let model = await entry.element.call<IElementModel>('model');
            let observableModel = new ElementModel(model);
            newModels[entry.element.id] = observableModel;
        }
    }

    // Merge new models into existing
    models = {...models, ...newModels};

    // If any of the new models are pages, iterate into them
    for (const model of Object.values(newModels)) {
        if (model.type === 'Page') {
            models = {...models, ...await fetchNonPresentModels(models, model)}
        }
    }

    return models;
}

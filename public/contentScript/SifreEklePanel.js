import CodeyzerBilesen from '/core/bilesenler/CodeyzerBilesen.js';
import { i18n, pluginUrlGetir } from '/core/util.js';

let template = () => /* html */`
<template>
     <style>
        :host {
            all: initial;
        }
        .codeyzer-body {
            color: #ff7f2a;
            background-color: #080808;
            font-family: Monospace;
            font-size: 15px;
            user-select: none;
        }

        .panel {
            border: 1px solid #ff7f2a;
            border-radius: 4px;
            background-color: #0f0f0f;
            padding: 15px 15px 15px 15px;
        }
    </style>
    <link rel="stylesheet" href="${pluginUrlGetir('/node_modules/bootstrap/dist/css/bootstrap.css')}">
    <div class="codeyzer-body panel">
        <img ref="codeyzerKapat" style="float: right; cursor: pointer;" src="${pluginUrlGetir('/images/kapat_icon.png')}"/>
        <div class="row">
            <div class="col-2">
                <img src="${pluginUrlGetir('/images/icon_48.png')}"/>
            </div>
            <div class="col-10 justify-content-center align-self-center">
                ${i18n('contentScript.yeniSifreBulundu')}
            </div>
        </div>
    </div>
</template>
`;

export default class SifreEklePanel extends CodeyzerBilesen {

    /** @type {HTMLImageElement} */ $codeyzerKapat

    constructor() {
        super(template);
    }

    connectedCallback() {
        super.connectedCallback();

        this.$codeyzerKapat = this.bilesen('codeyzerKapat');
    }

    init() {
       
    }
}
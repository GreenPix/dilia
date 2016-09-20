import * as validator from 'is-my-json-valid';
import {customFormats} from './custom-formats';


const layerDataSchema = {
    required: true,
    type: 'array',
    minItems: 1,
    items: {
        type: 'array',
        items: {
            required: true,
            type: 'object',
            properties: {
                tiles_id_base64: {
                    type: 'string',
                    required: true,
                    format: 'base64'
                },
                chipset_id: {
                    type: 'string',
                    required: true,
                    format: 'mongodbId'
                }
            }
        }
    }
};

// TODO(hard): Generate those from the `shared/map.ts` file
export const validateMapNew = validator({
    required: true,
    type: 'object',
    properties: {
        name: {
            required: true,
            type: 'string'
        },
        preview: {
            required: true,
            type: 'string',
            format: 'base64',
        },
        layers: {
            $ref: '#layer'
        },
        width: {
            required: true,
            type: 'number'
        },
        height: {
            required: true,
            type: 'number'
        },
        tile_size: {
            required: true,
            type: 'number'
        },
        comment: {
            required: true,
            type: 'string'
        }
    }
}, {
    formats: customFormats,
    schemas: { layer: layerDataSchema }
});

export const validateMapCommit = validator({
    required: true,
    type: 'object',
    properties: {
        layers: {
            $ref: '#layer'
        },
        comment: {
            required: true,
            type: 'number'
        },
        preview: {
            required: true,
            type: 'string'
        },
    }
}, {
    formats: customFormats,
    schemas: { layer: layerDataSchema }
});

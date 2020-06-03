'use strict';

const { hooks } = require('@adonisjs/ignitor')

hooks.after.providersBooted(() => {
    // paste code here
    const uniqueCombinationFn = async (data, field, message, args, get) => {
        const Database = use('Database')
        const util = require('util')

        let ignoreId = null
        const fields = args[1].split('/')
        const table = args[0]
        if (args[2]) {
            ignoreId = args[2]
        }

        const rows = await Database.table(table).where((builder) => {
        for (const f of fields) {
            builder.where(f, '=', get(data, f))
        }
        if (ignoreId) {
            builder.whereNot('id', '=', ignoreId)
        }
        }).count('* as total')

        if (rows[0].total) {
            throw message
        }
      };
    
    const Validator = use('Validator');
    Validator.extend('uniqueCombination', uniqueCombinationFn);
});
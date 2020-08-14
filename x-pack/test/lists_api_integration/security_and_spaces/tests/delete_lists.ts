/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import expect from '@kbn/expect';

import { FtrProviderContext } from '../../common/ftr_provider_context';
import { LIST_URL } from '../../../../plugins/lists/common/constants';

import { getCreateMinimalListSchemaMock } from '../../../../plugins/lists/common/schemas/request/create_list_schema.mock';
import {
  createListsIndex,
  deleteListsIndex,
  removeListServerGeneratedProperties,
} from '../../utils';
import { getListResponseMockWithoutAutoGeneratedValues } from '../../../../plugins/lists/common/schemas/response/list_schema.mock';

// eslint-disable-next-line import/no-default-export
export default ({ getService }: FtrProviderContext) => {
  const supertest = getService('supertest');

  describe('delete_lists', () => {
    describe('deleting lists', () => {
      beforeEach(async () => {
        await createListsIndex(supertest);
      });

      afterEach(async () => {
        await deleteListsIndex(supertest);
      });

      it('should delete a single list with a list id', async () => {
        // create a list
        await supertest
          .post(LIST_URL)
          .set('kbn-xsrf', 'true')
          .send(getCreateMinimalListSchemaMock())
          .expect(200);

        // delete the list by its list id
        const { body } = await supertest
          .delete(`${LIST_URL}?id=${getCreateMinimalListSchemaMock().id}`)
          .set('kbn-xsrf', 'true')
          .expect(200);

        const bodyToCompare = removeListServerGeneratedProperties(body);
        expect(bodyToCompare).to.eql(getListResponseMockWithoutAutoGeneratedValues());
      });

      it('should delete a single list using an auto generated id', async () => {
        // add a list
        const { body: bodyWithCreatedList } = await supertest
          .post(LIST_URL)
          .set('kbn-xsrf', 'true')
          .send(getCreateMinimalListSchemaMock())
          .expect(200);

        // delete that list by its auto-generated id
        const { body } = await supertest
          .delete(`${LIST_URL}?id=${bodyWithCreatedList.id}`)
          .set('kbn-xsrf', 'true')
          .expect(200);

        const bodyToCompare = removeListServerGeneratedProperties(body);
        expect(bodyToCompare).to.eql(getListResponseMockWithoutAutoGeneratedValues());
      });

      it('should return an error if the id does not exist when trying to delete it', async () => {
        const { body } = await supertest
          .delete(`${LIST_URL}?id=c1e1b359-7ac1-4e96-bc81-c683c092436f`)
          .set('kbn-xsrf', 'true')
          .expect(404);

        expect(body).to.eql({
          message: 'list id: "c1e1b359-7ac1-4e96-bc81-c683c092436f" was not found',
          status_code: 404,
        });
      });
    });
  });
};
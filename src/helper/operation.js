export class Operations {
  static queryGetAll = () => `
  query MyQuery {
    lab5_todo {
      deadline
      done
      id
      noteBody
      noteTitle
    }
  }
  `;

  static mutationInsert = (title, body, deadline) => `
  mutation MyMutation($deadline: timestamptz = "") {
    insert_lab5_todo(objects: {noteBody: "${body}",
     noteTitle: "${title}", done: false, deadline: "${deadline}"}) {
      returning {
        id
        noteBody
        noteTitle
        done
        deadline
      }
    }
  }
`;
  static mutationInsertWithoutDeadline = (title, body) => `
mutation MyMutation($deadline: timestamptz = "") {
  insert_lab5_todo(objects:
    {noteBody: "${body}", noteTitle: "${title}", done: false}) {
    returning {
      id
      noteBody
      noteTitle
      done
      deadline
    }
  }
}
`;
  static mutationDelete = (id) =>
    `mutation MyMutation {
    delete_lab5_todo_by_pk(id: ${id}){
      id
    }
  }

`;
  static mutationChecked = (id, checked) =>
    `mutation MyMutation {
      update_lab5_todo(where: {id: {_eq: ${id}}}, _set: {done: ${checked}}}) {
        returning {
          deadline
          done
          id
          noteBody
          noteTitle
          userid
        }
      }
    }
    `;
}

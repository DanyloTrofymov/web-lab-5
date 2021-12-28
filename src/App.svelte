
<script>
  import request from './helper/request';
  import { Operations } from './helper/operation';
  import { todos, isAuthenticated, user, token } from './store';
  import { onMount } from 'svelte';
  import { get } from 'svelte/store';
  import auth from './auth-service';

  let modalText = '';
  let titleValue = '';
  let bodyValue = '';
  let deadlineValue = '';
  let loaderEnabled = false;

  token.subscribe(async (tokenValue) => {
    if (tokenValue != '') {
      const {lab5_todo} = await request.startFetchMyQuery(
        Operations.queryGetAll(),
      );
      todos.set(lab5_todo);
    }
  });

  let auth0Client;
  onMount(async () => {
    auth0Client = await auth.createClient();
    isAuthenticated.set(await auth0Client.isAuthenticated());
    user.set(await auth0Client.getUser());
    if (isAuthenticated) {
      const accessToken = await auth0Client.getIdTokenClaims();
      if(accessToken){
      token.set(accessToken.__raw);
      }
    }
  });

  function login() {
    auth.loginWithPopup(auth0Client);
  }

  function logout() {
    auth.logout(auth0Client);
  }

  const addTask = async () => {
    loaderEnabled = true;
      if (titleValue == '') {
        openModal('Title can not be empty!');
        loaderEnabled = false;
        return;
      }
      if (deadlineValue == '') {
        const { insert_lab5_todo } = await request.startExecuteMyMutation(
          Operations.mutationInsertWithoutDeadline(titleValue, bodyValue),
        );
        todos.update((n) => [...n, insert_lab5_todo.returning[0]]);
      } else {
        const { insert_lab5_todo } = await request.startExecuteMyMutation(
          Operations.mutationInsert(titleValue, bodyValue, deadlineValue),
        );
        todos.update((n) => [...n, insert_lab5_todo.returning[0]]);
      }
      loaderEnabled = false;
  };
  const deleteTask = async (id) => {
    loaderEnabled = true;
    const { deleted } = await request.startExecuteMyMutation(
      Operations.mutationDelete(id),
    );
    todos.update((n) => n.filter((item) => item.id != id));
    loaderEnabled = false;
  };
  const updateChecked = async (id, checked) => {
    loaderEnabled = true;
    await request.startExecuteMyMutation(
      Operations.mutationChecked(id, checked),
    );
    loaderEnabled = false;
  };
  const openModal = (text) => {
    modalText = text;
  };

  const closeModal = () => {
    modalText = '';
  };

  window.onoffline = () => {
    openModal('You are currently offline!');
  };
</script>

<main>
  <div>
    {#if $isAuthenticated}
        {#if loaderEnabled}
          <div class="loader" />
        {/if}
        {#if modalText}
        <div class="modal-container">
          <div class="modal">
            <h1>Error</h1>
            <p>{modalText}</p>
            <button class="modal_button" id="close" on:click={closeModal}>
              Close
            </button>
          </div>
        </div>
      {/if}
      <button class=login on:click={logout}>Log out</button>
        <form class="form" on:submit|preventDefault={addTask}>
          <div class="form__section">
            <input
              type="text"
              name="Title"
              placeholder="Title"
              bind:value={titleValue}
            />
            <input
              type="text"
              body="body"
              placeholder="body"
              bind:value={bodyValue}
            />
            <input
              type="date"
              body="deadline"
              placeholder="deadline"
              bind:value={deadlineValue}
            />
          </div>
          <button>Add task</button>
        </form>
        <table border="1">
          <caption>ToDo</caption>
          <tr>
            <th>Done</th>
            <th>Id</th>
            <th>Title</th>
            <th>Body</th>
            <th>Deadline</th>
            <th>Delete</th>
          </tr>
          {#each $todos as task}
            <tr>
              <td
                ><input
                  type="checkbox"
                  checked={task.done}
                  on:click={() => updateChecked(task.id, !task.done)}
                /></td
              >
              <td>{task.id}</td>
              <td>{task.noteTitle}</td>
              <td>{task.noteBody}</td>
              <td>{task.deadline}</td>
              <td
                ><button class="delete" on:click={() => deleteTask(task.id)}
                  >Delete</button
                ></td
              >
            </tr>
          {/each}
        </table>
    {:else}
      <button class="login mainpage" on:click={login}>Log in</button>
    {/if}
  </div>
</main>

<style>
  :root {
    --background-color: lightblue;
    --form-background-color: #fff;
    --light-color: #eee;
    --dark-color: #000;
    --button-hover-color: gray;
    --loader-color: gray;
    --delete-color: rgb(163, 13, 13);
    --table-color: #3e3cca;
    --button-color: #4caf50;
    --login-button: #4676D7;
    --login-button-hover: #1d49aa;

  }
  main {
    margin: 0;
    max-width: 100%;
  }
  .form {
    background-color: var(--form-background-color);
    border-radius: 3px;
    padding: 20px;
    width: 700px;
    margin: auto;
    display: flex;
    gap: 20px;
    position: relative;
    border: 1px solid var(--light-color);
  }
  .form input,
  .form button {
    background-color: var(--light-color);
    outline: none;
    border: 1px solid var(--light-color);
    border-radius: 3px;
    padding: 10px;
  }

  table {
    border-collapse: collapse;
    margin: auto;
    width: 90%;
    border-left: 3px solid var(--table-color);
    border-right: 3px solid var(--table-color);
    border-bottom: 3px solid var(--table-color);
  }
  button {
    cursor: pointer;
  }
  .login{
    height: 50px;
    width: 200px;
  appearance: none;
  border: 0;
  border-radius: 5px;
  background: var(--login-button);
  color: var(--light-color);
  padding: 8px 16px;
  font-size: 16px;
  position: absolute;
  right: 0;
  }
  .login:hover {
  background: var(--login-button-hover);
}

.login:focus {
  outline: none;
  box-shadow: 0 0 0 4px var(--light-color);
}
.login.mainpage{
  position: fixed;
    top: 50%;
    left: 50%;
    transform: translateX(-50%);
}
  caption {
    background: var(--table-color);
    border-top-left-radius: 3px;
    border-top-right-radius: 3px;
    padding: 10px;
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.3);
    color: var(--light-color);
    font-family: 'Roboto Slab', serif;
    font-style: normal;
    font-size: 26px;
    text-align: center;
    margin: 0;
  }
  td,
  th {
    padding: 10px;
  }
  th {
    text-align: left;
    font-size: 18px;
  }
  tr:nth-child(2n) {
    background: var(--light-color);
  }
  tr:nth-child(2n-1) {
    background: var(--background-color);
  }
  td:last-of-type {
    text-align: center;
  }
  .delete {
    display: inline-block;
    padding: 5px 10px;
    background: var(--delete-color);
    color: var(--light-color);
    box-shadow: 2px 2px 0 0 var(--delete-color);
    position: relative;
  }
  .delete:hover {
    box-shadow: none;
    top: 2px;
    left: 2px;
  }
  .modal-container {
    background: rgba(0, 0, 0, 0.3);
    position: fixed;
    display: flex;
    align-items: center;
    justify-content: center;
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    width: 100vw;
    z-index: 1;
  }

  .modal {
    background-color: var(--light-color);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    width: 600px;
    border-radius: 5px;
    padding: 30px 50px;
    max-width: 100%;
    text-align: center;
  }

  .modal h1 {
    font-size: 20px;
    margin: 0;
  }
  .modal p {
    font-size: 14px;
    opacity: 0.9;
  }

  .loader {
    position: fixed;
    top: 50%;
    left: 50%;
    width: 80px;
    height: 80px;
  }
  .loader:after {
    background: rgba(0, 0, 0, 0.7);
    content: ' ';
    display: block;
    width: 64px;
    height: 64px;
    margin: 8px;
    border-radius: 50%;
    border: 6px solid;
    border-color: var(--button-hover-color) transparent;
    animation: loader 1.2s linear infinite;
  }
  @keyframes loader {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
</style>

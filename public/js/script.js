
document.addEventListener('DOMContentLoaded', () => {
  // 회원가입 폼 제출 이벤트 리스너
  document.getElementById('signupForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    fetch('/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({ username, password })
    })
    .then(response => response.text())
    .then(data => alert(data))
    .catch(error => console.error('Error:', error));
  });

  // 사용자 조회 버튼 클릭 이벤트 리스너
  document.getElementById('getUsersButton').addEventListener('click', () => {
    fetch('/users')
      .then(response => response.text())
      .then(data => {
        const userList = document.getElementById('userList');
        userList.innerHTML = data;
      })
      .catch(error => console.error('Error:', error));
  });

  // 비밀번호 수정 폼 제출 이벤트 리스너
  document.getElementById('updatePasswordForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('updateUsername').value;
    const newPassword = document.getElementById('newPassword').value;

    fetch('/update-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({ username, newPassword })
    })
    .then(response => response.text())
    .then(data => alert(data))
    .catch(error => console.error('Error:', error));
  });

  // 사용자 삭제 폼 제출 이벤트 리스너
  document.getElementById('deleteUserForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('deleteUsername').value;

    fetch('/delete-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({ username })
    })
    .then(response => response.text())
    .then(data => alert(data))
    .catch(error => console.error('Error:', error));
  });
});
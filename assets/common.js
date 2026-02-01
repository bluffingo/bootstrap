function error(error) {
    console.error("OpenSB Bootstrap Skin Error: " + error);
}

document.addEventListener("DOMContentLoaded", () => {
    const postBtn = document.getElementById("post");
    const commentInput = document.getElementById("commentContents");
    const spinner = document.getElementById("commentPostingSpinner");

    const subscribeBtn = document.getElementById("subscribe");
    const likeBtn = document.getElementById("like");
    const dislikeBtn = document.getElementById("dislike");

    const likesCount = document.getElementById("likes");
    const dislikesCount = document.getElementById("dislikes");

    const postJSON = (url, data, callback) => {
        fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams(data)
        })
            .then(res => res.text())
            .then(data => callback(data))
            .catch(err => error(err));
    };

    const updatePostButtonState = () => {
        const hasContent = commentInput.value.trim() !== "";
        postBtn.classList.toggle("disabled", !hasContent);
    };

    document.getElementById("action_unlogged")?.addEventListener("click", () => {
        alert('You cannot proceed with this action.');
    });

    // commenting (only works with uploads)

    updatePostButtonState();

    commentInput?.addEventListener("input", updatePostButtonState);

    postBtn?.addEventListener("click", () => {
        if (postBtn.classList.contains("disabled")) return;

        spinner.classList.remove("d-none");

        postJSON("/api/legacy/comment", {
            comment: commentInput.value.trim(),
            vidid: video_id,
            really: "ofcourse",
            type: "video"
        }, (data) => {
            document.getElementById("comment")?.insertAdjacentHTML("afterbegin", data);
            commentInput.value = "";
            updatePostButtonState();
            spinner.classList.add("d-none");
        });
    });

    // following

    subscribeBtn?.addEventListener("click", () => {
        postJSON("/api/legacy/subscribe", {
            subscription: user_id
        }, (data) => {
            if (data === subscribe_string) {
                subscribeBtn.textContent = subscribe_string;
                subscribeBtn.className = "btn btn-primary";
            } else if (data === unsubscribe_string) {
                subscribeBtn.textContent = unsubscribe_string;
                subscribeBtn.className = "btn btn-secondary";
            } else {
                error("Failed to follow user " + user_id);
            }
        });
    });

    // ratings

    likeBtn?.addEventListener("click", () => {
        if (likeBtn.classList.contains("text-success")) return;

        postJSON("/api/legacy/rate", {
            rating: 5,
            vidid: video_id
        }, (data) => {
            if (data == 1) {
                likeBtn.className = "text-success";
                dislikeBtn.className = "text-body";
                likesCount.textContent = Number(likesCount.textContent) + 1;
                dislikesCount.textContent = Number(dislikesCount.textContent) - 1;
            }
        });
    });

    dislikeBtn?.addEventListener("click", () => {
        if (dislikeBtn.classList.contains("text-danger")) return;

        postJSON("/api/legacy/rate", {
            rating: 1,
            vidid: video_id
        }, (data) => {
            if (data == 1) {
                dislikeBtn.className = "text-danger";
                likeBtn.className = "text-body";
                dislikesCount.textContent = Number(dislikesCount.textContent) + 1;
                likesCount.textContent = Number(likesCount.textContent) - 1;
            }
        });
    });
});
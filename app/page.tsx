export default function Home() {
  return (
    <>
      <header className="site-header">
        <div className="header-inner">
          <div id="auth-ui" className="auth-ui"></div>
          <form
            id="comment-form"
            className="comment-form header-form"
            aria-label="Add a comment"
            style={{ display: "none" }}
          >
            <textarea
              id="comment-body"
              name="body"
              rows={2}
              maxLength={2000}
              required
              placeholder="What's up Grand Rapids?"
            ></textarea>
            <div className="post-options">
              <label htmlFor="comment-bg-color" className="post-option-label">
                Background
              </label>
              <input
                type="color"
                id="comment-bg-color"
                name="background_color"
                defaultValue="#2563eb"
                className="post-option-color"
                aria-label="Post background color"
              />
              <label htmlFor="comment-font" className="post-option-label">
                Font
              </label>
              <select
                id="comment-font"
                name="font_family"
                className="post-option-font"
                aria-label="Post font"
              >
                <option value="Work Sans">Work Sans</option>
                <option value="Open Sans">Open Sans</option>
                <option value="Lora">Lora</option>
                <option value="Merriweather">Merriweather</option>
                <option value="Playfair Display">Playfair Display</option>
                <option value="Roboto">Roboto</option>
                <option value="Source Sans 3">Source Sans 3</option>
                <option value="Inter">Inter</option>
                <option value="Poppins">Poppins</option>
                <option value="Nunito">Nunito</option>
              </select>
            </div>
            <div id="turnstile-widget" className="turnstile-widget" aria-hidden="true"></div>
            <button type="submit" id="comment-submit" className="btn btn-submit">
              Post
            </button>
          </form>
        </div>
      </header>
      <main>
        <div id="comments-list" className="comments-list"></div>
      </main>
    </>
  );
}

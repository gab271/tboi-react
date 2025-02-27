import './Banner.css'

function Banner({ title }) {
  return (
    <>
      <div className="navbar-banner">
        <img src="./isaacbanner.jpg" alt="The Binding of Isaac" className="navbar-banner-img" />
        <h1 className="navbar-banner-title">{title}</h1>
      </div>
    </>
  )
}

export default Banner 
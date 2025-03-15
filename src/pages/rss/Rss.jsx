import RssFeed from '../../components/rss-feed/RssFeed';
import Header from "../../components/header/Header";
import Banner from "../../components/banner/Banner";
import Footer from "../../components/footer/Footer";
import './Rss.css';

const News = () => {
  return (
    <>
      <Header />
      <Banner title="Game News" />
      <div className="news-page">
        <RssFeed />
      </div>
      <Footer />
    </>
  );
};

export default News;
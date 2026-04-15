// ============================================
//   TOÀN BỘ DỮ LIỆU BÀI HÁT CHO APP NHẠC
// ============================================

export const GENRES = [
  { id: 'pop', label: 'Pop', color: '#FF6B6B', icon: 'musical-notes' },
  { id: 'ballad', label: 'Ballad', color: '#4ECDC4', icon: 'heart' },
  { id: 'indie', label: 'Indie', color: '#FFE66D', icon: 'planet' },
  { id: 'chill', label: 'Chill', color: '#A8E6CF', icon: 'leaf' },
  { id: 'rock', label: 'Rock', color: '#F7797D', icon: 'flash' },
  { id: 'vpop', label: 'V-Pop', color: '#c665e8', icon: 'star' },
  { id: 'rap', label: 'Rap', color: '#F8B500', icon: 'mic' },
  { id: 'edm', label: 'EDM', color: '#00B4DB', icon: 'pulse' },
];

export const ARTISTS = [
  { id: 'a1', name: 'Sơn Tùng M-TP', avatar: 'https://images.unsplash.com/photo-1493225457124-a1a2a5fd37b5?w=200&q=80', followers: '4.2M' },
  { id: 'a2', name: 'Châu Khải Phong', avatar: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&q=80', followers: '1.8M' },
  { id: 'a3', name: 'Mỹ Tâm', avatar: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&q=80', followers: '3.1M' },
  { id: 'a4', name: 'Hà Anh Tuấn', avatar: 'https://images.unsplash.com/photo-1501492673258-2fd6279b04d4?w=200&q=80', followers: '2.5M' },
  { id: 'a5', name: 'Bích Phương', avatar: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=200&q=80', followers: '1.2M' },
  { id: 'a6', name: 'Đen Vâu', avatar: 'https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=200&q=80', followers: '2.8M' },
];

export const SONGS = [
  {
    id: '1',
    title: 'Ngắm Hoa Lệ Rơi',
    artist: 'Châu Khải Phong',
    artistId: 'a2',
    album: 'Câu Chuyện Tình Yêu',
    genre: 'ballad',
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&q=80',
    url: 'https://res.cloudinary.com/djp9dqoyt/video/upload/v1764341350/gxqfxodncpz5phzl0dyt.mp3',
    duration: 264000,
    isNew: true,
    isFeatured: true,
    lyrics: `Dẫu biết đôi ta đã từng trải qua
Bao nhiêu năm thiết tha yêu như vậy mà, bây giờ lại xa lạ.
Con đường tình giờ anh một mình đành lặng thinh
Nhìn em bước về tay cầm tay vui đùa cùng với ai.

Ánh mắt đôi môi ta đã trót trao
Nhưng tại sao đến hôm nay lúc hiện tại
Em đã không còn được nhẫn nại
Bên cạnh người tình mới em đã quên rồi
Để anh khoác lên thân mình màu đơn côi.

Ta đã từng hứa yêu nhau đến muôn đời sau
Anh vẫn luôn khắc sâu nhưng hôm nay ân tình phai màu
Còn gì nữa đâu và đành buông lơi những câu
Ta phải xa rời nhau như hoa kia dần úa màu.

Trong lòng buồn mỗi khi anh ngắm hoa những dòng lệ rơi
Em giờ đang khác đi, anh biết chắc chắn sẽ không còn cơ hội
Đành vậy thế thôi, ân tình nay vỡ đôi
Anh chúc em luôn nở nụ cười yên vui.

(Nhạc dạo)

Dẫu biết đôi ta đã từng trải qua
Bao nhiêu năm thiết tha yêu như vậy mà, bây giờ lại xa lạ.
Con đường tình giờ anh một mình đành lặng thinh
Nhìn em bước về tay cầm tay vui đùa cùng với ai.

Ánh mắt đôi môi ta đã trót trao
Nhưng tại sao đến hôm nay lúc hiện tại
Em đã không còn được nhẫn nại
Bên cạnh người tình mới em đã quên rồi
Để anh khoác lên thân mình màu đơn côi.

Ta đã từng hứa yêu nhau đến muôn đời sau
Anh vẫn luôn khắc sâu nhưng hôm nay ân tình phai màu
Còn gì nữa đâu và đành buông lơi những câu
Ta phải xa rời nhau như hoa kia dần úa màu.

Trong lòng buồn mỗi khi anh ngắm hoa những dòng lệ rơi
Em giờ đang khác đi, anh biết chắc chắn sẽ không còn cơ hội
Đành vậy thế thôi, ân tình nay vỡ đôi
Anh chúc em luôn nở nụ cười yên vui.







`,
  },
  {
    id: '2',
    title: 'Hãy Trao Cho Anh',
    artist: 'Sơn Tùng M-TP',
    artistId: 'a1',
    album: 'Sky Tour',
    genre: 'vpop',
    image: 'https://images.unsplash.com/photo-1493225457124-a1a2a5fd37b5?w=500&q=80',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
    duration: 237000,
    isNew: true,
    isFeatured: true,
    lyrics: `Hãy trao cho anh
Hãy trao cho anh
Tình yêu của em đong đầy

Trong giấc mơ anh
Chỉ có bóng em
Soi sáng cho cuộc đời này`,
  },
  {
    id: '3',
    title: 'Chờ Người Nơi Ấy',
    artist: 'Mỹ Tâm',
    artistId: 'a3',
    album: 'My',
    genre: 'pop',
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    duration: 218000,
    isNew: false,
    isFeatured: true,
    lyrics: `Chờ người nơi ấy có hay chăng
Rằng em đang nhớ thương da diết
Chiều chiều đứng trông về xa xăm
Chỉ thấy bóng hoàng hôn lặng thiếng`,
  },
  {
    id: '4',
    title: 'Tháng Năm Là Mãi Mãi',
    artist: 'Hà Anh Tuấn',
    artistId: 'a4',
    album: 'Portrait',
    genre: 'ballad',
    image: 'https://images.unsplash.com/photo-1501492673258-2fd6279b04d4?w=500&q=80',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    duration: 285000,
    isNew: false,
    isFeatured: false,
    lyrics: `Tháng năm là mãi mãi
Dù có bao điều thay đổi
Em vẫn là của anh thôi
Dù thời gian có trôi`,
  },
  {
    id: '5',
    title: 'Bùa Yêu',
    artist: 'Bích Phương',
    artistId: 'a5',
    album: 'Bùa Yêu',
    genre: 'vpop',
    image: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=500&q=80',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    duration: 195000,
    isNew: true,
    isFeatured: true,
    lyrics: `Bùa yêu anh đã trao
Khiến em mãi vương vấn không thôi
Chỉ một cái nhìn của anh thôi
Đủ làm tim em rộn ràng`,
  },
  {
    id: '6',
    title: 'Mang Tiền Về Cho Mẹ',
    artist: 'Đen Vâu',
    artistId: 'a6',
    album: 'Tết',
    genre: 'rap',
    image: 'https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=500&q=80',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
    duration: 248000,
    isNew: false,
    isFeatured: true,
    lyrics: `Con đi học xa nhà
Mẹ ở nhà chờ con
Ngày con về thăm mẹ
Mang theo tình thương con

Mang tiền về cho mẹ
Mang về cho mẹ nụ cười
Dù đường xa mấy ngàn dặm
Con vẫn về bên mẹ thôi`,
  },
  {
    id: '7',
    title: 'Chill Acoustic Mix',
    artist: 'Various Artists',
    artistId: 'a1',
    album: 'Chill Vibes',
    genre: 'chill',
    image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500&q=80',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    duration: 320000,
    isNew: true,
    isFeatured: false,
    lyrics: `Nhẹ nhàng trôi theo gió
Buông bỏ mọi lo âu
Ngồi đây thật bình yên
Chill cùng âm nhạc thôi`,
  },
  {
    id: '8',
    title: 'Indie Dreams',
    artist: 'Hà Anh Tuấn',
    artistId: 'a4',
    album: 'Indie Vietnam',
    genre: 'indie',
    image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=500&q=80',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    duration: 198000,
    isNew: false,
    isFeatured: false,
    lyrics: `Trong giấc mơ indie
Tiếng đàn ghi-ta nhẹ nhàng
Mình đi giữa thành phố
Tìm kiếm điều gì đó`,
  },
  {
    id: '9',
    title: 'EDM Night',
    artist: 'DJ Minh Trí',
    artistId: 'a1',
    album: 'Festival 2024',
    genre: 'edm',
    image: 'https://images.unsplash.com/photo-1563841930606-67e2bce48b78?w=500&q=80',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
    duration: 360000,
    isNew: true,
    isFeatured: false,
    lyrics: `Drop the beat
Feel the heat
Dance all night
Until the light`,
  },
  {
    id: '10',
    title: 'Rock Việt Nam',
    artist: 'Bích Phương',
    artistId: 'a5',
    album: 'Rock Legends',
    genre: 'rock',
    image: 'https://images.unsplash.com/photo-1493225457124-a1a2a5fd37b5?w=500&q=80',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
    duration: 210000,
    isNew: false,
    isFeatured: false,
    lyrics: `Rock không bao giờ chết
Tiếng guitar rền vang
Nhịp trống cuốn theo sóng
Rock Việt mãi trường tồn`,
  },
  {
    id: '11',
    title: 'Sau Tất Cả',
    artist: 'ERIK',
    artistId: 'a1',
    album: 'ERIK Hits',
    genre: 'vpop',
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&q=80',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3',
    duration: 225000,
    isNew: false,
    isFeatured: true,
    lyrics: `Sau tất cả những điều đã qua
Em vẫn chọn quay về bên anh
Dù đau thương dù đã cách xa
Trái tim em mãi nhớ tới anh`,
  },
  {
    id: '12',
    title: 'Gác Lại Âu Lo',
    artist: 'Đen Vâu',
    artistId: 'a6',
    album: 'Đen Và Trắng',
    genre: 'rap',
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3',
    duration: 198000,
    isNew: true,
    isFeatured: false,
    lyrics: `Gác lại âu lo
Gác lại muộn phiền
Sống chậm lại thôi
Tận hưởng khoảnh khắc này`,
  },
  {
    id: '13',
    title: 'Yêu Một Người Có Lẽ',
    artist: 'Sơn Tùng M-TP',
    artistId: 'a1',
    album: 'M-TP Collection',
    genre: 'pop',
    image: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=500&q=80',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3',
    duration: 243000,
    isNew: false,
    isFeatured: false,
    lyrics: `Yêu một người có lẽ
Là không cần lý do
Chỉ cần trái tim thấy
Thì mọi thứ đều đẹp ho`,
  },
  {
    id: '14',
    title: 'Ranh Giới',
    artist: 'Mỹ Tâm',
    artistId: 'a3',
    album: 'My 2',
    genre: 'ballad',
    image: 'https://images.unsplash.com/photo-1501492673258-2fd6279b04d4?w=500&q=80',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3',
    duration: 312000,
    isNew: false,
    isFeatured: false,
    lyrics: `Ranh giới của yêu thương
Là sợi chỉ mong manh
Mình đứng hai bên đó
Không dám bước qua nhau`,
  },
  {
    id: '15',
    title: 'Midnight Chill',
    artist: 'Various Artists',
    artistId: 'a2',
    album: 'Late Night',
    genre: 'chill',
    image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500&q=80',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3',
    duration: 275000,
    isNew: true,
    isFeatured: false,
    lyrics: `Đêm khuya lặng yên
Chỉ còn tiếng nhạc
Ngồi đây một mình
Chill cùng đêm thôi`,
  },
  {
    id: '16',
    title: 'Từ Hôm Nay',
    artist: 'Bích Phương',
    artistId: 'a5',
    album: 'New Me',
    genre: 'pop',
    image: 'https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=500&q=80',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3',
    duration: 188000,
    isNew: true,
    isFeatured: true,
    lyrics: `Từ hôm nay anh không còn nhớ em
Từ hôm nay cuộc sống bắt đầu lại
Những ký ức ta có dù đẹp bao nhiêu
Cũng xin gác lại thôi`,
  },
  {
    id: '17',
    title: 'Xuân Hạ Thu Đông',
    artist: 'Hà Anh Tuấn',
    artistId: 'a4',
    album: 'Bốn Mùa',
    genre: 'indie',
    image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=500&q=80',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3',
    duration: 267000,
    isNew: false,
    isFeatured: false,
    lyrics: `Xuân về hoa nở
Hạ sang nắng vàng  
Thu qua lá rụng
Đông về lạnh giá`,
  },
  {
    id: '18',
    title: 'Nhớ Mãi Ngàn Năm',
    artist: 'Châu Khải Phong',
    artistId: 'a2',
    album: 'Tình Ca',
    genre: 'ballad',
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&q=80',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-17.mp3',
    duration: 298000,
    isNew: false,
    isFeatured: false,
    lyrics: `Nhớ mãi ngàn năm
Tình yêu của chúng ta
Dù thời gian có qua
Tôi vẫn mãi yêu em`,
  },
  {
    id: '19',
    title: 'Vũ Trụ Trong Em',
    artist: 'Đen Vâu',
    artistId: 'a6',
    album: 'Trốn Tìm',
    genre: 'rap',
    image: 'https://images.unsplash.com/photo-1563841930606-67e2bce48b78?w=500&q=80',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-18.mp3',
    duration: 215000,
    isNew: true,
    isFeatured: true,
    lyrics: `Vũ trụ trong em rộng vô cùng
Mỗi ánh mắt là một ngôi sao
Nụ cười em sáng như mặt trăng
Trái tim anh lạc trong vũ trụ đó`,
  },
  {
    id: '20',
    title: 'Sóng Gió',
    artist: 'JACK',
    artistId: 'a1',
    album: 'JACK Hits',
    genre: 'vpop',
    image: 'https://images.unsplash.com/photo-1493225457124-a1a2a5fd37b5?w=500&q=80',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-19.mp3',
    duration: 232000,
    isNew: false,
    isFeatured: true,
    lyrics: `Sóng gió cuộn dâng
Tình yêu bão tố
Mình vẫn bên nhau
Dù sóng có to`,
  },
  {
    id: '21',
    title: 'Đêm Màu Hồng',
    artist: 'Mỹ Tâm',
    artistId: 'a3',
    album: 'Pink Night',
    genre: 'pop',
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-20.mp3',
    duration: 204000,
    isNew: true,
    isFeatured: false,
    lyrics: `Đêm nay sao trời sáng quá
Màu hồng phủ khắp nơi
Trong tim anh đang thắp sáng
Ánh lửa tình yêu này`,
  },
  {
    id: '22',
    title: 'Lofi Study Beat',
    artist: 'Lofi Lab',
    artistId: 'a4',
    album: 'Study with Me',
    genre: 'chill',
    image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500&q=80',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    duration: 390000,
    isNew: false,
    isFeatured: false,
    lyrics: `[Lofi Beat - No lyrics]`,
  },
];

// Lấy bài hát theo genre
export const getSongsByGenre = (genreId) =>
  SONGS.filter((s) => s.genre === genreId);

// Lấy bài hát mới nhất
export const getNewSongs = () => SONGS.filter((s) => s.isNew);

// Lấy bài featured
export const getFeaturedSongs = () => SONGS.filter((s) => s.isFeatured);

// Lấy bài hát theo nghệ sĩ
export const getSongsByArtist = (artistId) =>
  SONGS.filter((s) => s.artistId === artistId);

// Tìm kiếm
export const searchSongs = (query) => {
  const q = query.toLowerCase();

  // Match genres by exact label or id (avoid 'pop' matching 'v-pop')
  const matchedGenres = GENRES.filter(
    (g) => g.label.toLowerCase() === q || g.id.toLowerCase() === q
  ).map((g) => g.id);

  return SONGS.filter(
    (s) =>
      s.title.toLowerCase().includes(q) ||
      s.artist.toLowerCase().includes(q) ||
      s.album.toLowerCase().includes(q) ||
      (s.lyrics && s.lyrics.toLowerCase().includes(q)) ||
      matchedGenres.includes(s.genre)
  );
};

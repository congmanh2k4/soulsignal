export default function CommunityPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16 space-y-10">
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">SoulSignal</p>
        <h1 className="text-4xl font-bold">Quy Tắc Cộng Đồng & Điều Khoản</h1>
        <p className="text-neutral-600">
          Chân thành, nghiêm túc nhưng ấm áp. Vui lòng đọc kỹ và đồng thuận trước khi tiếp tục.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Cam kết bảo mật</h2>
        <ul className="list-disc space-y-2 pl-5 text-neutral-700">
          <li>IG của bạn được giữ trong &quot;két sắt&quot; dữ liệu và chỉ hiển thị khi chính bạn đồng ý (giai đoạn Reveal).</li>
          <li>Chúng tôi không bán, cho thuê hay chia sẻ dữ liệu cá nhân cho bên thứ ba.</li>
          <li>Mọi truy cập đều được kiểm soát và ghi log; bạn có thể yêu cầu xoá tài khoản và dữ liệu.</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Quy tắc ứng xử (Code of Conduct)</h2>
        <ul className="list-disc space-y-2 pl-5 text-neutral-700">
          <li>Zero tolerance for harassment: cấm quấy rối, đe doạ, miệt thị, phân biệt đối xử, spam.</li>
          <li>Anti-ghosting: bơ tin nhắn sẽ trừ điểm uy tín; nếu muốn dừng, hãy dùng nút &quot;Dừng kết nối&quot; để kết thúc văn minh.</li>
          <li>Không gửi ảnh nhạy cảm: hệ thống hiện không hỗ trợ gửi ảnh để bảo vệ người dùng.</li>
          <li>Tôn trọng quyền riêng tư: không yêu cầu đối phương chia sẻ thông tin nhận diện thật khi chưa đến giai đoạn Reveal và chưa có sự đồng thuận.</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Cơ chế xác thực</h2>
        <ul className="list-disc space-y-2 pl-5 text-neutral-700">
          <li>Vì sao cần IG thật: để xác minh bạn là người thật, giảm rủi ro clone/scam và tăng độ an toàn cho cộng đồng.</li>
          <li>IG được bảo vệ: không ai thấy IG của bạn cho đến khi cả hai bên đồng ý Reveal; trước đó chỉ dùng cho mục đích xác thực nội bộ.</li>
          <li>Bạn có quyền kiểm soát: bạn quyết định khi nào (hoặc không bao giờ) Reveal.</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Hành vi bị cấm</h2>
        <ul className="list-disc space-y-2 pl-5 text-neutral-700">
          <li>Giả mạo danh tính, tạo nhiều tài khoản để thao túng tương tác.</li>
          <li>Quấy rối, đe doạ, gửi nội dung kích động thù hận hoặc phi pháp.</li>
          <li>Khai thác lỗ hổng, tấn công kỹ thuật, thu thập dữ liệu trái phép.</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Hậu quả vi phạm</h2>
        <ul className="list-disc space-y-2 pl-5 text-neutral-700">
          <li>Cảnh báo, tạm khóa, hoặc chấm dứt tài khoản tùy mức độ.</li>
          <li>Trừ điểm uy tín, hạn chế match đối với hành vi ghosting hoặc cư xử thiếu tôn trọng.</li>
          <li>Báo cáo tới cơ quan chức năng nếu có hành vi vi phạm pháp luật.</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Quyền của bạn</h2>
        <ul className="list-disc space-y-2 pl-5 text-neutral-700">
          <li>Quyền được tôn trọng, an toàn, và kiểm soát thông tin riêng.</li>
          <li>Quyền báo cáo hành vi xấu; chúng tôi sẽ phản hồi và xử lý.</li>
          <li>Quyền yêu cầu truy cập, chỉnh sửa, xoá dữ liệu cá nhân.</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Trách nhiệm của bạn</h2>
        <ul className="list-disc space-y-2 pl-5 text-neutral-700">
          <li>Chia sẻ trung thực, cư xử tôn trọng, chủ động giao tiếp rõ ràng.</li>
          <li>Bảo vệ tài khoản của bạn, không chia sẻ mã xác thực.</li>
          <li>Sử dụng tính năng &quot;Dừng kết nối&quot; thay vì ghosting.</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Liên hệ & hỗ trợ</h2>
        <p className="text-neutral-700">
          Nếu bạn gặp quấy rối hoặc cần trợ giúp, hãy báo cáo ngay trong ứng dụng hoặc liên hệ đội ngũ hỗ trợ. Chúng tôi luôn ưu tiên sự an toàn và trải nghiệm của bạn.
        </p>
      </section>
    </main>
  );
}

// jQuery code untuk mengubah warna teks dengan id "title" menjadi biru
$(document).ready(function() {
    // Cara 1: Langsung ubah saat halaman dimuat
    $("#title").css("color", "blue");
    
    // Cara 2: Ubah saat tombol diklik (opsional)
    $("#ubahBtn").click(function() {
        $("#title").css("color", "blue");
    });
    
    // Cara 3: Menggunakan method .attr() atau .prop() juga bisa
    // document.getElementById("title").style.color = "blue";
});
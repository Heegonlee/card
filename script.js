document.getElementById('generateBtn').addEventListener('click', async () => {
    const githubToken = document.getElementById('apiKey').value.trim(); 
    const type = document.getElementById('type').value;
    const concept = document.getElementById('concept').value.trim();
    const outputDiv = document.getElementById('designOutput');

    if (!githubToken) return alert('GitHub Personal Access Token을 입력해주세요.');
    if (!concept) return alert('내용을 입력해주세요.');

    outputDiv.innerHTML = "<p style='text-align:center;'>🚀 깃허브 가상 백엔드 서버를 부팅하여 AI 요청을 전달 중입니다... (약 20~30초 소요)</p>";

    // 💡 본인의 실제 정보로 교체 필수!
    const githubUser = "Heegonlee"; 
    const repoName = "card";
    
    const triggerUrl = `https://github.com{githubUser}/${repoName}/dispatches`;

    try {
        // 1. GitHub Actions 가상 서버 깨우기 (Trigger)
        const response = await fetch(triggerUrl, {
            method: 'POST',
            headers: {
                'Accept': 'application/vnd.github+json',
                'Authorization': `token ${githubToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                event_type: "request-design",
                client_payload: { type: type, concept: concept }
            })
        });

        if (!response.ok) throw new Error("깃허브 서버 호출 실패. 토큰 유효성이나 ID를 확인하세요.");

        outputDiv.innerHTML = "<p style='text-align:center;'>⏳ 깃허브 가상 컴퓨터가 파이썬 코드로 디자인 조립 중... 실시간으로 파일 생성을 감시합니다.</p>";

        // 2. 가상 서버가 일하고 결과 파일(result.html)을 업로드할 때까지 폴링(주기적 확인) 시작
        setTimeout(async function checkResult() {
            const resultUrl = `https://${githubUser}.github.io/${repoName}/result.html?t=${new Date().getTime()}`;
            try {
                const resFile = await fetch(resultUrl);
                if (resFile.ok) {
                    const htmlCode = await resFile.text();
                    outputDiv.className = type === 'business_card' ? 'business_card_size' : 'brochure_size';
                    outputDiv.innerHTML = htmlCode;
                    document.getElementById('downloadBtn').style.display = 'block';
                } else {
                    outputDiv.innerHTML += "."; // 대기 상태 표시 점 추가
                    setTimeout(checkResult, 3000); // 3초 뒤에 다시 파일 가져오기 시도
                }
            } catch (e) {
                setTimeout(checkResult, 3000);
            }
        }, 15000); // 가상 머신이 깨어나고 통신을 완료하기 위한 최소 15초 초기 대기

    } catch (error) {
        console.error(error);
        outputDiv.innerHTML = `<p style='color:red; text-align:center;'>에러 발생: ${error.message}</p>`;
    }
});

// PDF 파일 인쇄 및 다운로드 기능
document.getElementById('downloadBtn').addEventListener('click', () => {
    const element = document.getElementById('designOutput');
    const type = document.getElementById('type').value;
    
    const opt = {
        margin:       0,
        filename:     type === 'business_card' ? 'my-business-card.pdf' : 'product-brochure.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true }, 
        jsPDF:        type === 'business_card' ? { unit: 'mm', format: [90, 50], orientation: 'landscape' } : { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
});

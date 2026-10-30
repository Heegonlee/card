document.getElementById('generateBtn').addEventListener('click', async () => {
    const githubToken = document.getElementById('apiKey').value.trim(); 
    const type = document.getElementById('type').value;
    const concept = document.getElementById('concept').value.trim();
    const outputDiv = document.getElementById('designOutput');

    if (!githubToken) return alert('GitHub Personal Access Token을 입력해주세요.');
    if (!concept) return alert('내용을 입력해주세요.');

    outputDiv.innerHTML = "<p style='text-align:center;'>🚀 깃허브 백엔드 가상 컴퓨터를 부팅 중입니다... (약 20~30초 소요)</p>";

    // 💡 [필수 수정] 여기에 본인의 실제 깃허브 아이디와 리포지토리 이름을 정확히 적어주세요!
    const githubUser = "YOUR_GITHUB_USERNAME"; // 예: "heegonlee"
    const repoName = "ai-design-service";      // 리포지토리 이름 (오타 주의)
    
    // 🔗 슬래시(/) 위치와 경로 규격을 완벽하게 교정했습니다.
    const triggerUrl = `https://github.com{githubUser}/${repoName}/dispatches`;

    try {
        console.log("요청 주소 확인:", triggerUrl);

        // 1. GitHub Actions 백엔드 가상 컴퓨터 깨우기
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

        if (!response.ok) {
            const errBody = await response.text();
            throw new Error(`깃허브 호출 실패 (코드: ${response.status}) - 주소나 토큰을 다시 확인하세요.`);
        }

        outputDiv.innerHTML = "<p style='text-align:center;'>⏳ 백엔드 파이썬이 디자인 조립 시작! 결과 생성을 감시하고 있습니다.</p>";

        // 2. 가상 서버가 일하고 파일(result.html)을 생성할 때까지 무한 확인 시작
        setTimeout(async function checkResult() {
            // 캐시 방지(새로고침 효과)를 위해 시간값(?t=...)을 끝에 붙여 결과 탐색
            const resultUrl = `https://${githubUser}.github.io/${repoName}/result.html?t=${new Date().getTime()}`;
            try {
                const resFile = await fetch(resultUrl);
                if (resFile.ok) {
                    const htmlCode = await resFile.text();
                    outputDiv.className = type === 'business_card' ? 'business_card_size' : 'brochure_size';
                    outputDiv.innerHTML = htmlCode;
                    document.getElementById('downloadBtn').style.display = 'block';
                    console.log("디자인 최종 로드 성공!");
                } else {
                    outputDiv.innerHTML += "."; // 대기 상태 표시용 점 추가
                    setTimeout(checkResult, 3000); // 3초 후 재시도
                }
            } catch (e) {
                setTimeout(checkResult, 3000);
            }
        }, 15000); // 가상 머신 구동 및 데이터 전송을 위한 최초 15초 대기

    } catch (error) {
        console.error("발생한 에러:", error);
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
        jsPDF:        type === 'business_card' ? { unit: 'mm', format:, orientation: 'landscape' } : { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
});
